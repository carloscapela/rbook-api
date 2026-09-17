import "server-only";
import { createSwaggerSpec } from "next-swagger-doc";

export function getApiDocs() {
  return createSwaggerSpec({
    apiFolder: "src/app/api",
    definition: {
      openapi: "3.0.0",
      info: {
        title: "rbooks API",
        version: "1.0.0",
        description:
          "API do rbooks: autenticação (JWT via Bearer token) e CRUD de livros, sessões de leitura e metas.",
      },
      servers: [{ url: "/", description: "Servidor atual" }],
      tags: [
        { name: "Auth", description: "Registro, login e sessão atual" },
        { name: "Books", description: "Livros do usuário autenticado" },
        {
          name: "Reading Sessions",
          description: "Sessões de leitura, aninhadas em um livro",
        },
        { name: "Metas", description: "Metas de leitura do usuário" },
        { name: "Health", description: "Healthcheck" },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description:
              "Token retornado por /api/auth/login ou /api/auth/register, enviado como `Authorization: Bearer <token>`.",
          },
        },
        schemas: {
          User: {
            type: "object",
            properties: {
              id: { type: "integer", example: 1 },
              uuid: { type: "string", format: "uuid" },
              name: { type: "string", example: "Carlos" },
              email: { type: "string", format: "email" },
              created_at: { type: "string", format: "date-time" },
            },
          },
          Book: {
            type: "object",
            properties: {
              id: { type: "integer", example: 1 },
              created_at: { type: "string", format: "date-time" },
              user_id: { type: "integer" },
              title: { type: "string", example: "Duna" },
              author: { type: "string", nullable: true, example: "Frank Herbert" },
              imge_url: { type: "string", nullable: true },
              total_pages: { type: "integer", nullable: true, example: 600 },
              type_book: { type: "string", nullable: true, example: "ficcao" },
              status: { type: "integer", nullable: true },
              note: { type: "string", nullable: true },
              data_init: { type: "string", format: "date-time", nullable: true },
              data_final: { type: "string", format: "date-time", nullable: true },
            },
          },
          ReadingSession: {
            type: "object",
            properties: {
              id: { type: "integer", example: 1 },
              created_at: { type: "string", format: "date-time" },
              book_id: { type: "integer" },
              page_ini: { type: "integer", nullable: true, example: 1 },
              page_final: { type: "integer", nullable: true, example: 50 },
              time_reading: { type: "string", nullable: true, example: "01:30" },
              notes: { type: "string", nullable: true },
            },
          },
          Meta: {
            type: "object",
            properties: {
              id: { type: "integer", example: 1 },
              created_at: { type: "string", format: "date-time" },
              user_id: { type: "integer" },
              type: { type: "integer", nullable: true, example: 1 },
              period: { type: "integer", nullable: true, example: 30 },
              value_check: { type: "string", nullable: true, example: "10 livros" },
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
      security: [{ BearerAuth: [] }],
    },
  });
}
