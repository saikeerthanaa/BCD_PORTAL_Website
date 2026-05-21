from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, Form
from sqlalchemy.orm import Session
from typing import List
import boto3
from botocore.exceptions import NoCredentialsError
from ..db import session
from ..models import models
from ..core.config import settings

router = APIRouter()

def get_db():
    db = session.SessionLocal()
    try:
        yield db
    finally:
        db.close()

def upload_to_gcs(file: UploadFile, file_name: str):
    """Uploads a file to Google Cloud Storage."""
    s3_client = boto3.client(
        's3',
        aws_access_key_id=settings.GCS_ACCESS_KEY,
        aws_secret_access_key=settings.GCS_SECRET_KEY,
        endpoint_url=f"https://{settings.GCS_BUCKET_NAME}.storage.googleapis.com"
    )
    try:
        s3_client.upload_fileobj(
            file.file,
            settings.GCS_BUCKET_NAME,
            file_name
        )
        return f"https://storage.googleapis.com/{settings.GCS_BUCKET_NAME}/{file_name}"
    except NoCredentialsError:
        raise HTTPException(status_code=500, detail="Could not authenticate with GCS.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not upload to GCS: {str(e)}")

@router.post("/upload")
async def upload_mammograms(
    patient_id: int = Form(...),
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    """
    Uploads mammogram files to GCS and updates the database with the URLs.
    """
    db_upload = db.query(models.MammogramUpload).filter(models.MammogramUpload.patient_id == patient_id).first()
    if not db_upload:
        db_upload = models.MammogramUpload(patient_id=patient_id)
        db.add(db_upload)
        db.commit()
        db.refresh(db_upload)

    for file in files:
        file_name = file.filename
        gcs_url = upload_to_gcs(file, file_name)
        
        view_type = file_name.split('_')[1].lower()

        if view_type == 'rmlo':
            db_upload.rmlo_url = gcs_url
        elif view_type == 'rcc':
            db_upload.rcc_url = gcs_url
        elif view_type == 'lmlo':
            db_upload.lmlo_url = gcs_url
        elif view_type == 'lcc':
            db_upload.lcc_url = gcs_url

    db.commit()
    db.refresh(db_upload)

    return {"patient_id": db_upload.patient_id, "urls": {
        "rmlo": db_upload.rmlo_url,
        "rcc": db_upload.rcc_url,
        "lmlo": db_upload.lmlo_url,
        "lcc": db_upload.lcc_url,
    }}
