import React from "react";
import PageNotFound from "../assets/images/page-not-found.jpg";

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
      <img src={PageNotFound} alt="Pagina no Encontrada" style={
        {
          width: '100%',
          height: '90vh'
        }
      }/>
    </>
  )
}
