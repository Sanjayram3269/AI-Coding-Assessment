import os
import subprocess
import tempfile
import time


MAX_EXECUTION_TIME = 5


def run_python_code(code: str) -> dict:
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


        start_time = time.perf_counter()


        process = subprocess.run(
            ["python", temp_path],

            capture_output=True,

            text=True,

            timeout=MAX_EXECUTION_TIME,

            cwd=os.path.dirname(temp_path),
        )


        end_time = time.perf_counter()


        execution_time_ms = int(
            (end_time - start_time) * 1000
        )


        if process.returncode == 0:

            status = "success"

        else:

            status = "error"


        return {
            "status": status,
            "stdout": process.stdout,
            "stderr": process.stderr,
            "execution_time_ms": execution_time_ms,
        }


    except subprocess.TimeoutExpired:

        return {
            "status": "timeout",
            "stdout": "",
            "stderr": (
                "Execution timed out after "
                f"{MAX_EXECUTION_TIME} seconds."
            ),
            "execution_time_ms":
                MAX_EXECUTION_TIME * 1000,
        }


    except Exception as exc:

        return {
            "status": "error",
            "stdout": "",
            "stderr": str(exc),
            "execution_time_ms": 0,
        }


    finally:

        if temp_path and os.path.exists(temp_path):

            try:
                os.remove(temp_path)

            except OSError:
                pass