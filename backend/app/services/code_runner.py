import os
import re
import shutil
import subprocess
import sys
import tempfile
import time


PYTHON_RUN_TIMEOUT = 5

CPP_COMPILE_TIMEOUT = 10
CPP_RUN_TIMEOUT = 5

JAVA_COMPILE_TIMEOUT = 15
JAVA_RUN_TIMEOUT = 10

EXE_SUFFIX = ".exe" if os.name == "nt" else ""


def _timeout_result(seconds: int) -> dict:
    return {
        "status": "timeout",
        "stdout": "",
        "stderr": f"Execution timed out after {seconds} seconds.",
        "execution_time_ms": seconds * 1000,
    }


def _error_result(message: str) -> dict:
    return {
        "status": "error",
        "stdout": "",
        "stderr": message,
        "execution_time_ms": 0,
    }


def _run_timed(
    command: list[str],
    stdin: str,
    timeout: int,
    cwd: str,
) -> tuple[subprocess.CompletedProcess, int]:
    start_time = time.perf_counter()

    process = subprocess.run(
        command,
        input=stdin,
        capture_output=True,
        text=True,
        timeout=timeout,
        cwd=cwd,
    )

    execution_time_ms = int(
        (time.perf_counter() - start_time) * 1000
    )

    return process, execution_time_ms


def run_python_code(code: str, stdin: str = "") -> dict:
    temp_path = None

    try:
        with tempfile.NamedTemporaryFile(
            mode="w",
            suffix=".py",
            delete=False,
            encoding="utf-8",
        ) as temp_file:

            temp_file.write(code)

            temp_path = temp_file.name

        process, execution_time_ms = _run_timed(
            [sys.executable, temp_path],
            stdin,
            PYTHON_RUN_TIMEOUT,
            os.path.dirname(temp_path),
        )

        status = "success" if process.returncode == 0 else "error"

        # Tracebacks reference the sandboxed temp file by its real
        # server-side path (e.g. C:\Users\...\AppData\Local\Temp\tmpXXXX.py).
        # Replace it with a stable, candidate-facing filename instead of
        # leaking server filesystem details into the UI.
        stderr = (
            process.stderr.replace(temp_path, "solution.py")
            if process.stderr
            else process.stderr
        )

        return {
            "status": status,
            "stdout": process.stdout,
            "stderr": stderr,
            "execution_time_ms": execution_time_ms,
        }

    except subprocess.TimeoutExpired:
        return _timeout_result(PYTHON_RUN_TIMEOUT)

    except Exception as exc:
        return _error_result(str(exc))

    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except OSError:
                pass


def run_cpp_code(code: str, stdin: str = "") -> dict:
    work_dir = tempfile.mkdtemp(prefix="cpp_")

    src_path = os.path.join(work_dir, "solution.cpp")
    exe_path = os.path.join(work_dir, "solution" + EXE_SUFFIX)

    try:
        with open(src_path, "w", encoding="utf-8") as src_file:
            src_file.write(code)

        # --- Compile ---
        try:
            compile_process = subprocess.run(
                [
                    "g++",
                    "-O2",
                    "-std=c++17",
                    "-o",
                    exe_path,
                    src_path,
                ],
                capture_output=True,
                text=True,
                timeout=CPP_COMPILE_TIMEOUT,
                cwd=work_dir,
            )

        except subprocess.TimeoutExpired:
            return _timeout_result(CPP_COMPILE_TIMEOUT)

        except FileNotFoundError:
            return _error_result(
                "C++ compiler (g++) is not available on the server."
            )

        if compile_process.returncode != 0:
            return {
                "status": "error",
                "stdout": "",
                "stderr": (
                    "Compilation failed:\n"
                    + compile_process.stderr.replace(
                        src_path, "solution.cpp"
                    )
                ),
                "execution_time_ms": 0,
            }

        # --- Run ---
        try:
            process, execution_time_ms = _run_timed(
                [exe_path],
                stdin,
                CPP_RUN_TIMEOUT,
                work_dir,
            )

        except subprocess.TimeoutExpired:
            return _timeout_result(CPP_RUN_TIMEOUT)

        status = "success" if process.returncode == 0 else "error"

        stderr = (
            process.stderr.replace(src_path, "solution.cpp")
            if process.stderr
            else process.stderr
        )

        return {
            "status": status,
            "stdout": process.stdout,
            "stderr": stderr,
            "execution_time_ms": execution_time_ms,
        }

    except Exception as exc:
        return _error_result(str(exc))

    finally:
        shutil.rmtree(work_dir, ignore_errors=True)


def _java_class_name(code: str) -> str:
    match = re.search(
        r"public\s+(?:final\s+|abstract\s+)?class\s+(\w+)", code
    )

    if match:
        return match.group(1)

    match = re.search(r"\bclass\s+(\w+)", code)

    if match:
        return match.group(1)

    return "Main"


def run_java_code(code: str, stdin: str = "") -> dict:
    work_dir = tempfile.mkdtemp(prefix="java_")

    class_name = _java_class_name(code)
    src_path = os.path.join(work_dir, f"{class_name}.java")

    try:
        with open(src_path, "w", encoding="utf-8") as src_file:
            src_file.write(code)

        # --- Compile ---
        try:
            compile_process = subprocess.run(
                ["javac", src_path],
                capture_output=True,
                text=True,
                timeout=JAVA_COMPILE_TIMEOUT,
                cwd=work_dir,
            )

        except subprocess.TimeoutExpired:
            return _timeout_result(JAVA_COMPILE_TIMEOUT)

        except FileNotFoundError:
            return _error_result(
                "Java compiler (javac) is not available on the server."
            )

        if compile_process.returncode != 0:
            return {
                "status": "error",
                "stdout": "",
                "stderr": (
                    "Compilation failed:\n"
                    + compile_process.stderr.replace(
                        src_path, f"{class_name}.java"
                    )
                ),
                "execution_time_ms": 0,
            }

        # --- Run ---
        try:
            process, execution_time_ms = _run_timed(
                ["java", "-cp", work_dir, class_name],
                stdin,
                JAVA_RUN_TIMEOUT,
                work_dir,
            )

        except subprocess.TimeoutExpired:
            return _timeout_result(JAVA_RUN_TIMEOUT)

        status = "success" if process.returncode == 0 else "error"

        stderr = (
            process.stderr.replace(src_path, f"{class_name}.java")
            if process.stderr
            else process.stderr
        )

        return {
            "status": status,
            "stdout": process.stdout,
            "stderr": stderr,
            "execution_time_ms": execution_time_ms,
        }

    except Exception as exc:
        return _error_result(str(exc))

    finally:
        shutil.rmtree(work_dir, ignore_errors=True)


RUNNERS = {
    "python": run_python_code,
    "cpp": run_cpp_code,
    "c++": run_cpp_code,
    "java": run_java_code,
}


def run_code(language: str, code: str, stdin: str = "") -> dict:
    runner = RUNNERS.get(language.lower())

    if runner is None:
        return _error_result(
            f"Execution is not supported for language: {language}"
        )

    return runner(code, stdin)
