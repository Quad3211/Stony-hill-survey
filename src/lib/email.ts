import emailjs from "emailjs-com";

// TODO: Replace these with your actual EmailJS credentials
// You can get these from https://dashboard.emailjs.com/admin
const EMAILJS_SERVICE_ID = "service_8tdsn45";
const EMAILJS_TEMPLATE_ID = "template_ct6a4tl";
const EMAILJS_PUBLIC_KEY = "PRk5cwejggUcqKFZy";

// The Admin Email addresses to receive notifications.
// To send to multiple people efficiently (1 request), separate emails with a comma.
// Example: "principal@school.edu, headboy@school.edu, safety@school.edu"
const ADMIN_EMAIL = "nathanaelcoote@gmail.com";

export interface EmailParams {
  name: string;
  time: string;
  message: string;
  link: string;
}

export const sendNewSubmissionEmail = async (params: EmailParams) => {
  try {
    const templateParams = {
      to_email: ADMIN_EMAIL,
      name: params.name,
      time: params.time,
      message: params.message,
      link: params.link, // For the button URL in template
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY,
    );

    console.log("Email sent successfully!", response.status, response.text);
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    // We don't want to block the user experience if email fails, so we just log it.
    return false;
  }
};
