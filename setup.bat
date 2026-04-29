@echo off
REM Setup script for Windows development environment

echo Creating virtual environment...
python -m venv venv

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing dependencies...
pip install -r requirements.txt

echo.
echo Setup complete! To run the application:
echo   1. Activate virtual environment: venv\Scripts\activate
echo   2. Run: python app.py
echo   3. Visit: http://localhost:5000
echo.
echo Login credentials:
echo   - Admin: dennis / lopez
echo   - Purchasing Officer: jani / jani
echo   - Finance Officer: angel / angel
echo   - Store Owner: jennifer / jennifer
