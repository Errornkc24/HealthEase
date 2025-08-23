import { useState } from 'react';

const useForm = (initialState, validate) => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (submitted && validate) setErrors(validate({ ...form, [name]: value }));
  };

  const handleSubmit = (e, onSubmit) => {
    e.preventDefault();
    setSubmitted(true);
    if (validate) {
      const newErrors = validate(form);
      setErrors(newErrors);
      if (Object.keys(newErrors).length === 0) onSubmit(form);
    } else {
      onSubmit(form);
    }
  };

  return { form, setForm, errors, setErrors, submitted, setSubmitted, handleChange, handleSubmit };
};

export default useForm; 