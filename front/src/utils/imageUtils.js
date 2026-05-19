export const getImageUrl = (imagePath) => {
  if (!imagePath) return "/placeholder.svg";
  if (imagePath.startsWith("http")) return imagePath;
  return `http://isetso-backend-lb-617645434.us-east-1.elb.amazonaws.com/api/image/${imagePath}`;
};
