from typing import Optional

from sqlalchemy.orm import Session

from ..models.models import PatientResponse

PATIENT_ID_QUESTION_PATTERN = "%enter your patient id%"


def get_patient_id_for_session(db: Session, session_id: int, hospital_id: int) -> Optional[str]:
    patient_id_response = db.query(PatientResponse).filter(
        PatientResponse.hospital_id == hospital_id,
        PatientResponse.session_id == session_id,
        PatientResponse.question.ilike(PATIENT_ID_QUESTION_PATTERN),
    ).order_by(PatientResponse.created_at.asc()).first()

    return patient_id_response.answer if patient_id_response else None


def get_session_by_patient_id(db: Session, hospital_id: int, patient_id: str):
    return db.query(PatientResponse).filter(
        PatientResponse.hospital_id == hospital_id,
        PatientResponse.question.ilike(PATIENT_ID_QUESTION_PATTERN),
        PatientResponse.answer == patient_id,
    ).order_by(PatientResponse.created_at.asc()).first()
