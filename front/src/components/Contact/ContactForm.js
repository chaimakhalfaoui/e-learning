import React, { useRef, useState } from "react";
import emailjs from "@emailjs/browser";

const ContactForm = (props) => {
  const [formStatus, setFormStatus] = useState(null);
  const form = useRef();

  const validateForm = () => {
    const formData = new FormData(form.current);
    const name = formData.get("user_name");
    const email = formData.get("user_email");
    const message = formData.get("message");
    
    if (!name || !email || !message) {
      setFormStatus({ type: "error", message: "Please fill in all fields." });
      return false;
    }
    return true;
  };

  const sendEmail = (e) => {
    e.preventDefault();
    if (validateForm()) {
      emailjs
        .sendForm(
          "service_j3xeepa",
          "template_jkd8k6r",
          form.current,
          "I1JHt0y6_GtE1KE0A"
        )
        .then(
          (result) => {
            console.log(result.text);
            setFormStatus({ type: "success", message: "Message sent successfully." });
          },
          (error) => {
            console.log(error.text);
            setFormStatus({ type: "error", message: "Failed to send message. Please try again." });
          }
        );
    }
  };

  const { submitBtnClass, btnText } = props;

  const formStatusStyles = {
    success: {
      color: "#28a745",
      backgroundColor: "#d4edda",
      borderColor: "#c3e6cb",
      padding: "10px",
      borderRadius: "5px",
      textAlign: "center",
      marginTop: "10px"
      
    },
    error: {
      color: "#dc3545",
      backgroundColor: "#f8d7da",
      borderColor: "#f5c6cb",
      padding: "10px",
      borderRadius: "5px",
      textAlign: "center",
      marginTop: "10px"
    }
  };

  return (
    <form id="contact-form" ref={form} onSubmit={sendEmail}>
      <div className="row">
        <div className="col-12 mb-30">
          <input className="form-control" type="text" id="name" name="user_name" placeholder="Name" required />
        </div>
        <div className="col-12 mb-30">
          <input className="form-control" type="email" id="email" name="user_email" placeholder="E-Mail" required />
        </div>
        <div className="col-12 mb-30">
          <textarea className="form-control" id="message" name="message" placeholder="Your message here" required></textarea>
        </div>
        
      </div>
      <div className="btn-part">
        <button className={submitBtnClass ? submitBtnClass : 'readon learn-more submit'} type="submit">
          {btnText ? btnText : 'Submit Now'}
        </button>
      </div>
      {formStatus && (
          <div style={formStatus.type === "success" ? formStatusStyles.success : formStatusStyles.error}>
            {formStatus.message}
          </div>
        )}
    </form>
  );
}

export default ContactForm;