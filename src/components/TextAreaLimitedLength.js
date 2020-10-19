import React from "react";
import {Form} from "react-bootstrap";

export default ({value, maxLength, setValue, ...props}) => {
  return (
    <>
      <Form.Control
        as="textarea"
        value={value}
        maxLength={maxLength}
        onChange={event => setValue(event.target.value)}
        {...props}
      />
      <Form.Text className="text-muted">{value.length} out of {maxLength}</Form.Text>
    </>
  );
};
