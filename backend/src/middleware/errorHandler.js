const notFound = (_request, response) => {
  response.status(404).json({ error: { message: "API endpoint not found." } });
};
const errorHandler = (error, _request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }
  const type =
    typeof error === "object" && error !== null && "type" in error
      ? error.type
      : undefined;
  if (type === "entity.parse.failed") {
    response
      .status(400)
      .json({ error: { message: "Request body must contain valid JSON." } });
    return;
  }
  if (type === "entity.too.large") {
    response
      .status(413)
      .json({ error: { message: "Request body exceeds the 100 KB limit." } });
    return;
  }
  console.error("An unexpected API error occurred.");
  response
    .status(500)
    .json({ error: { message: "An unexpected server error occurred." } });
};
export { errorHandler, notFound };
