import React from "react";
import forbidden from "../assets/images/403-forbidden.jpg";

export default ({history}) => {
  return (
    <>
      <h3 style={{
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'transparent',
        border: 0,
        cursor: 'pointer',
        color: 'white'
      }} onClick={() => history.push("/home")}>
        Volver a Home
      </h3>
      <img src={forbidden} alt="Pagina no Encontrada" style={
        {
          width: '100%',
          height: '80vh'
        }
      }/>
    </>
  )
}
