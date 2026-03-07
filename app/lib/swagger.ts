import swaggerJsdoc from "swagger-jsdoc"

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Orbot API",
      version: "1.0.0",
      description: "API documentation for Orbot — AI-Powered Homework Assistant",
    },
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
          },
        },
        Question: {
          type: "object",
          properties: {
            id: { type: "string" },
            content: { type: "string" },
            subject: { type: "string" },
            status: { type: "string", enum: ["pending", "answered"] },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Answer: {
          type: "object",
          properties: {
            id: { type: "string" },
            content: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        FollowUp: {
          type: "object",
          properties: {
            id: { type: "string" },
            question: { type: "string" },
            answer: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
      },
    },
    paths: {
      "/api/auth/register": {
        post: {
          tags: ["Authentication"],
          summary: "Register a new user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "email", "password"],
                  properties: {
                    name: { type: "string", example: "John Doe" },
                    email: { type: "string", example: "john@example.com" },
                    password: { type: "string", example: "password123" },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "User registered successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      user: { $ref: "#/components/schemas/User" },
                    },
                  },
                },
              },
            },
            400: {
              description: "Email already exists or invalid input",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
      },
      "/api/auth/login": {
        post: {
          tags: ["Authentication"],
          summary: "Login with email and password",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", example: "john@example.com" },
                    password: { type: "string", example: "password123" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Login successful",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      user: { $ref: "#/components/schemas/User" },
                    },
                  },
                },
              },
            },
            401: {
              description: "Invalid credentials",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
      },
      "/api/auth/logout": {
        post: {
          tags: ["Authentication"],
          summary: "Logout current user",
          responses: {
            200: {
              description: "Logged out successfully",
            },
          },
        },
      },
      "/api/questions": {
        get: {
          tags: ["Questions"],
          summary: "Get all questions for current user",
          security: [{ cookieAuth: [] }],
          responses: {
            200: {
              description: "List of questions",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Question" },
                  },
                },
              },
            },
            401: {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
        post: {
          tags: ["Questions"],
          summary: "Create a new question and get AI answer",
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["content", "subject"],
                  properties: {
                    content: { type: "string", example: "What is photosynthesis?" },
                    subject: { type: "string", example: "Biology" },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "Question created with AI answer",
              content: {
                "application/json": {
                  schema: {
                    allOf: [
                      { $ref: "#/components/schemas/Question" },
                      {
                        type: "object",
                        properties: {
                          answer: { $ref: "#/components/schemas/Answer" },
                        },
                      },
                    ],
                  },
                },
              },
            },
            401: {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
      },
      "/api/questions/{id}": {
        get: {
          tags: ["Questions"],
          summary: "Get a single question with its answer",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Question ID",
            },
          ],
          responses: {
            200: {
              description: "Question details with answer",
              content: {
                "application/json": {
                  schema: {
                    allOf: [
                      { $ref: "#/components/schemas/Question" },
                      {
                        type: "object",
                        properties: {
                          answer: { $ref: "#/components/schemas/Answer" },
                        },
                      },
                    ],
                  },
                },
              },
            },
            404: {
              description: "Question not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
        delete: {
          tags: ["Questions"],
          summary: "Delete a question and all its data",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Question ID",
            },
          ],
          responses: {
            200: {
              description: "Question deleted successfully",
            },
            404: {
              description: "Question not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
        patch: {
          tags: ["Questions"],
          summary: "Update question content",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Question ID",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    content: { type: "string", example: "Updated question text" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Question updated successfully",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Question" },
                },
              },
            },
          },
        },
      },
      "/api/questions/{id}/followup": {
        get: {
          tags: ["Follow-ups"],
          summary: "Get all follow-up questions for a question",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Question ID",
            },
          ],
          responses: {
            200: {
              description: "List of follow-up questions",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/FollowUp" },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ["Follow-ups"],
          summary: "Ask a follow-up question and get AI response",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Question ID",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["question"],
                  properties: {
                    question: { type: "string", example: "Can you explain it more simply?" },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "Follow-up created with AI answer",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/FollowUp" },
                },
              },
            },
          },
        },
      },
      "/api/users/profile": {
        put: {
          tags: ["Users"],
          summary: "Update user profile",
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "currentPassword"],
                  properties: {
                    name: { type: "string", example: "John Doe" },
                    currentPassword: { type: "string", example: "oldpassword" },
                    newPassword: { type: "string", example: "newpassword123" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Profile updated successfully",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/User" },
                },
              },
            },
            400: {
              description: "Incorrect current password",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
}

export const swaggerSpec = swaggerJsdoc(options)