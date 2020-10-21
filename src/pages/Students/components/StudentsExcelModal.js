import React, { useContext, useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import ExcelReader from "../../../components/ExcelReader/ExcelReader";
import { generateUniqueKey } from "../../../utils/generateUniqueKey";
import { newErrorToast } from "../../../utils/toasts";
import {
  addStudent,
  removeAllStudents,
} from "../../../services/firebase/operations/students";
import { AuthContext } from "../../../App";

export default ({ show, handleClose }) => {
  const { plan } = useContext(AuthContext);

  const [totalInserts, setTotalInserts] = useState(0);
  const [newData, setNewData] = useState(null);
  const [showFinish, setShowFinish] = useState(false);

  useEffect(() => {
    if (newData && totalInserts) setShowFinish(true);
  }, [newData]);

  const handleBulkData = (data) => {
    const dataValid = data
      .filter((item) => item.nombre)
      .map((student) => {
        const slug = generateUniqueKey();

        return {
          slug: slug,
          Name: student.nombre,
          Comments: student.comentario,
          NumberOfStudents: student.estudiantes,
        };
      });
    setTotalInserts(dataValid.length);

    setNewData(dataValid);
  };

  const saveData = async () => {
    try {
      await removeAllStudents(plan);
      newData.forEach((student) => {
        addStudent(plan, student.slug, student).then();
      });
    } catch (error) {
      newErrorToast(`ERROR: ${error.message}`);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Importar desde Excel</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          Por favor, asegúrese de que el archivo sea Excel y tenga las
          siguientes columnas.
          <ul>
            <li>nombre</li>
            <li>comentario</li>
            <li>estudiantes (opcional)</li>
          </ul>
        </div>
        <ExcelReader callbackData={handleBulkData} />
        {showFinish ? (
          <>
            <h4 className="text-info mt-2">{`Se han encontrado: ${totalInserts} registros`}</h4>
            <div>
              <Button onClick={saveData}>Guardar</Button>
            </div>
          </>
        ) : null}
      </Modal.Body>
    </Modal>
  );
};
