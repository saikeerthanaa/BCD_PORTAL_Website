-- -----------------------------------------------------
-- Table `mammogram_uploads`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mammogram_uploads` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `patient_id` INT NOT NULL,
  `rmlo_url` VARCHAR(255) NULL,
  `rcc_url` VARCHAR(255) NULL,
  `lmlo_url` VARCHAR(255) NULL,
  `lcc_url` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `patient_id_UNIQUE` (`patient_id` ASC) VISIBLE,
  CONSTRAINT `fk_mammogram_uploads_patient`
    FOREIGN KEY (`patient_id`)
    REFERENCES `patients` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);
