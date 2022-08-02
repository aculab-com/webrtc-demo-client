import React, { useState } from "react";

type InputFieldProps = {
  fieldName: string;
  id: string;
}

const InputField = (props: InputFieldProps) => {
  const [value, setValue] = useState('');
  return (
    <form>
      <label>{props.fieldName}:<br></br>
        {/* <input type="text" /> */}
        <input id={props.id} size={10} value={value} disabled={false} onChange={(text) => setValue(text.target.value)} />
      </label>
    </form>
    
  )
}

export default InputField;