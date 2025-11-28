import YAML from "yamljs";

function swaggerDocument(PORT) {
  // swagger docs
  const swagger = YAML.load("./swagger.yaml");

  // Dynamic Base URL
  swagger.servers = [
    {
      url: `http://localhost:${PORT || 3000}`,
      description: "Local Server",
    },
  ];

  // Security Schemes
  swagger.components = {
    ...swagger.components,
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  };

  // Apply Security Globally
  swagger.security = [
    {
      BearerAuth: [],
    },
  ];
  return swagger;
}

export default swaggerDocument;
