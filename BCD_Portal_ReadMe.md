# BCD Portal - Breast Cancer Screening Portal

This repository contains the codebase for the **Breast Cancer Detection (BCD)** screening platform. The application enables a seamless medical workflow: authenticating hospital staff, loading patient queues, reviewing questionnaire answers, uploading multi-view mammogram DICOM/image sets, and conducting detailed clinical doctor assessments.

---

## 🚀 Setup & Local Execution Guide

To start the application locally, open **two separate terminal tabs** in your IDE (e.g., VS Code or terminal emulator) at the root of the repository:

### 🛠️ Python Virtual Environment Setup (First-Time Only)

Since virtual environments are ignored by Git, other team members will need to create their own local `.venv` and install the backend dependencies first.

1. **Navigate to the backend directory**:
   ```bash
   cd bcd_portal_copy/backend
   ```
2. **Create a new virtual environment**:
   ```bash
   python -m venv .venv
   ```
3. **Activate the virtual environment**:
   * **PowerShell (Windows)**:
     ```powershell
     .\.venv\Scripts\Activate.ps1
     ```
     *(If PowerShell blocks script execution, run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process` first)*
   * **Git Bash / macOS / Linux**:
     ```bash
     source .venv/bin/activate
     ```
4. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
5. **Return to the project root**:
   ```bash
   cd ..
   ```

---

### 1. Terminal 1: Run the Backend (Uvicorn)

Make sure you are in the root project folder (`bcd_portal_copy`). Activate your virtual environment and start uvicorn:

#### **PowerShell (Windows Default)**
```powershell
# 1. Navigate to the project root directory
cd bcd_portal_copy

# 2. Activate your virtual environment
.\backend\.venv\Scripts\Activate.ps1

# 3. Set PYTHONPATH to the current directory
$env:PYTHONPATH="."

# 4. Start the Uvicorn backend server
uvicorn backend.src.main:app --host 0.0.0.0 --port 8000 --reload
```

#### **Git Bash / Linux / macOS**
```bash
cd bcd_portal_copy
source backend/.venv/bin/activate
export PYTHONPATH=.
uvicorn backend.src.main:app --host 0.0.0.0 --port 8000 --reload
```

#### **Command Prompt (cmd)**
```cmd
cd bcd_portal_copy
call backend\.venv\Scripts\activate.bat
set PYTHONPATH=.
uvicorn backend.src.main:app --host 0.0.0.0 --port 8000 --reload
```

---

### 2. Terminal 2: Run the Frontend (React)

Open a second terminal at the root of the repository, navigate into the frontend folder, install dependencies, and launch the React development server.

> [!NOTE]
> We have added a global package override for **`ajv`** and **`ajv-keywords`** directly inside `frontend/package.json`. This guarantees npm resolves compatible transitive dependencies under all Node versions (especially Node 20/22+) and prevents the common React 19/Webpack `Cannot find module 'ajv/dist/compile/codegen'` error.

#### **PowerShell (Windows Default)**
```powershell
# 1. Navigate to the frontend directory
cd bcd_portal_copy/frontend

# 2. Install dependencies (resolving peer dependency flags for React 19)
npm install --legacy-peer-deps

# 3. Point it to the backend and start the dev server on port 3005
$env:REACT_APP_API_URL="http://localhost:8000"
$env:PORT=3005
npm start
```

#### **Git Bash / Linux / macOS**
```bash
cd bcd_portal_copy/frontend
npm install --legacy-peer-deps
REACT_APP_API_URL=http://localhost:8000 PORT=3005 npm start
```

#### **Command Prompt (cmd)**
```cmd
cd bcd_portal_copy/frontend
npm install --legacy-peer-deps
set REACT_APP_API_URL=http://localhost:8000
set PORT=3005
npm start
```

---

## 🛠️ Troubleshooting & Common Port Conflicts

### 1. "WinError 10013" (Port 8000 is Already in Use)
If you get a socket access error, another background process is already using port 8000. 

* **Option A: Kill the existing process automatically (Windows PowerShell)**
  Run this command inside a **PowerShell** terminal to kill any process currently listening on port 8000:
  ```powershell
  Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
  ```

* **Option B: Run the Backend on port 8001 instead**
  If port 8000 is occupied by a system process you cannot kill, simply start the backend on port **8001**:
  * **Backend Terminal**:
    ```powershell
    $env:PYTHONPATH="."
    uvicorn backend.src.main:app --host 0.0.0.0 --port 8001 --reload
    ```
  * **Frontend Terminal**:
    ```powershell
    $env:REACT_APP_API_URL="http://localhost:8001"
    $env:PORT=3005
    npm start
    ```

### 2. "ModuleNotFoundError: No module named 'backend'"
This happens if you run the uvicorn command from inside the `backend` folder itself. Python expects the command to run from the root `bcd_portal_copy` directory. If you are inside the `backend` folder, run `cd ..` first.

---

## 🔑 Seeded Credentials for Testing

To log in and navigate the hospital staff workflow, use the following seeded account data:

* **Portal**: Hospital Portal / Staff Login
* **Hospital Name**: Select **`Test1`** (or another active seeded hospital) from the dropdown
* **Staff Name**: *Any name (e.g., Dr. Jane Doe)*
* **Email**: `breastcancerdetection@tanuh.ai`
* **Password**: `BestWishes26`

---

## 📋 Comprehensive Staff Workflow Walkthrough

Once you are successfully logged in, follow these steps to see the entire clinical flow in action:

1. **Patients Queue**: You will land on the patients list at [http://localhost:3005/hospital/patients](http://localhost:3005/hospital/patients) showing active patient IDs.
2. **Review Questionnaire Answers**: Click on any patient ID (e.g., **`PAT001`**). You will see the stored responses mapped from their screening questionnaire.
3. **Upload Mammogram Views**: Click **Upload Mammogram** at the bottom of the questionnaire page. You will land on `/mammogram-upload` where you can upload RCC, RMLO, LCC, and MLO views.
4. **Clinical Doctor Assessment**: Click **Proceed to Assessment Results**. You will land on `/doctor-assessment` where the active session and patient context are preserved. Fill in the clinical review, breast composition findings, and click **Save Assessment** to save the record to the backend and return to the patients dashboard!
