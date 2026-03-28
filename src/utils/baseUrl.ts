export const getBaseUrl = () => {
  if (window.location.hostname === "localhost") {
    // return "http://localhost:3030";
    return "https://ai-portal-api-22579b377a84.herokuapp.com";
  } else {
    return "https://ai-portal-api-22579b377a84.herokuapp.com";
  }
};
