import { useState, useEffect } from "react";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import {
  Page,
  Card,
  Layout,
  Text,
  BlockStack,
  TextField,
  Select,
  Tabs,
  Button,
  Icon,
  Badge,
  Banner,
  List,
  Thumbnail,
  DataTable,
  Pagination,
  Spinner,
  EmptyState,
  ChoiceList,
  Checkbox,
  InlineStack,
  Box,
  Divider,
  Modal
} from "@shopify/polaris";
import {
  SearchIcon,
  FilterIcon,
  CheckIcon,
  InfoIcon,
  ChatIcon,
  SettingsIcon
} from "@shopify/polaris-icons";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigation } from "@remix-run/react";

/* 
 * Loader para obtener datos iniciales
 * Simula una API con datos de configuración del chatbot,
 * métricas y tickets
 */
export const loader = async () => {
  // Configuración inicial del chatbot
  const chatbotConfig = {
    name: "ShopBot",
    status: "active",
    welcomeMessage: "¡Hola! ¿En qué puedo ayudarte hoy?",
    personality: "friendly",
    schedule: {
      start: "09:00",
      end: "18:00",
      timezone: "America/Mexico_City"
    },
    responses: [
      {
        id: "1",
        question: "¿Cuánto cuesta el envío?",
        answer: "El envío es gratuito para compras mayores a $500",
        triggers: ["envío", "costo envío", "gratis"]
      },
      {
        id: "2",
        question: "¿Cuánto tarda en llegar?",
        answer: "El tiempo de entrega es de 3-5 días hábiles",
        triggers: ["tiempo entrega", "días llegada"]
      }
    ]
  };

  // Métricas del chatbot
  const metrics = {
    totalConversations: 1243,
    resolutionRate: 87,
    avgResponseTime: 1.2,
    satisfactionRate: 92,
    ticketsCreated: 56
  };

  // Tickets de soporte
  const tickets = [
    {
      id: "T12345",
      customer: "Juan Pérez",
      email: "juan@example.com",
      reason: "Problema con pedido",
      date: "2023-10-27",
      status: "open"
    },
    {
      id: "T12346",
      customer: "María García",
      email: "maria@example.com",
      reason: "Consulta de producto",
      date: "2023-10-27",
      status: "resolved"
    },
    {
      id: "T12347",
      customer: "Carlos López",
      email: "carlos@example.com",
      reason: "Información de envío",
      date: "2023-10-26",
      status: "pending"
    }
  ];

  return json({ chatbotConfig, metrics, tickets });
};

/* 
 * Componente principal de la página del chatbot
 * Maneja la interfaz de usuario y la lógica del chatbot
 */
export default function ChatbotPage() {
  // Obtener datos del loader
  const { chatbotConfig, metrics, tickets } = useLoaderData();
  const navigation = useNavigation();
  const app = useAppBridge();

  // Estados del componente
  const [activeTab, setActiveTab] = useState(0);
  const [config, setConfig] = useState(chatbotConfig);
  const [newResponse, setNewResponse] = useState({
    question: "",
    answer: "",
    triggers: ""
  });
  const [activeModal, setActiveModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = [
    {
      id: "dashboard",
      content: "Dashboard",
      panelID: "dashboard-content"
    },
    {
      id: "conversations",
      content: "Conversaciones",
      panelID: "conversations-content"
    },
    {
      id: "configuration",
      content: "Configuración",
      panelID: "configuration-content"
    }
  ];

  const toggleStatus = () => {
    setConfig({
      ...config,
      status: config.status === "active" ? "inactive" : "active"
    });
  };

  const addResponse = () => {
    if (newResponse.question && newResponse.answer) {
      setConfig({
        ...config,
        responses: [
          ...config.responses,
          {
            id: Date.now().toString(),
            question: newResponse.question,
            answer: newResponse.answer,
            triggers: newResponse.triggers.split(",").map(t => t.trim())
          }
        ]
      });
      setNewResponse({ question: "", answer: "", triggers: "" });
      setActiveModal(null);
    }
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Page
      title="Chatbot AI"
      subtitle="Configuración y análisis de tu asistente virtual"
      primaryAction={{
        content: "Nueva respuesta",
        icon: CheckIcon,
        onAction: () => setActiveModal("new-response")
      }}
    >
      <TitleBar title="Chatbot AI" />
      
      <Tabs
        tabs={[
          {
            id: "dashboard",
            content: "Dashboard",
            panelID: "dashboard-content"
          },
          {
            id: "conversations",
            content: "Conversaciones",
            panelID: "conversations-content"
          },
          {
            id: "configuration",
            content: "Configuración",
            panelID: "configuration-content"
          }
        ]}
        selected={activeTab}
        onSelect={setActiveTab}
      >
        <Layout>
          {activeTab === 0 && (
            <>
              <Layout.Section>
                <BlockStack gap="400">
                  <Banner
                    title={`Chatbot ${config.status === "active" ? "activo" : "inactivo"}`}
                    icon={config.status === "active" ? CheckIcon : InfoIcon}
                    tone={config.status === "active" ? "success" : "warning"}
                    action={{
                      content: config.status === "active" ? "Desactivar" : "Activar",
                      onAction: toggleStatus
                    }}
                  >
                    <p>
                      {config.status === "active"
                        ? "El chatbot está actualmente activo y disponible para tus clientes."
                        : "El chatbot está inactivo y no responderá a los clientes."}
                    </p>
                  </Banner>

                  <Card>
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "1rem",
                      padding: "1.5rem"
                    }}>
                      <Box padding="400">
                        <Text as="h3" variant="headingSm">Conversaciones totales</Text>
                        <Text as="p" variant="headingXl">{metrics.totalConversations}</Text>
                        <Text as="p" variant="bodySm" tone="success">
                          +12% desde el mes pasado
                        </Text>
                      </Box>
                      <Box padding="400">
                        <Text as="h3" variant="headingSm">Tasa de resolución</Text>
                        <Text as="p" variant="headingXl">{metrics.resolutionRate}%</Text>
                        <Text as="p" variant="bodySm" tone="success">
                          +5.2% desde el mes pasado
                        </Text>
                      </Box>
                      <Box padding="400">
                        <Text as="h3" variant="headingSm">Tiempo respuesta</Text>
                        <Text as="p" variant="headingXl">{metrics.avgResponseTime}s</Text>
                        <Text as="p" variant="bodySm" tone="critical">
                          -0.3s desde el mes pasado
                        </Text>
                      </Box>
                      <Box padding="400">
                        <Text as="h3" variant="headingSm">Satisfacción</Text>
                        <Text as="p" variant="headingXl">{metrics.satisfactionRate}%</Text>
                        <Text as="p" variant="bodySm" tone="success">
                          +3.1% desde el mes pasado
                        </Text>
                      </Box>
                    </div>
                  </Card>
                </BlockStack>
              </Layout.Section>

              <Layout.Section variant="oneThird">
                <Card>
                  <BlockStack gap="400">
                    <Text as="h3" variant="headingMd">Respuestas frecuentes</Text>
                    <List type="bullet">
                      {config.responses.slice(0, 5).map((response) => (
                        <List.Item key={response.id}>
                          <Text as="span" fontWeight="medium">{response.question}</Text>
                        </List.Item>
                      ))}
                    </List>
                    <Button
                      variant="plain"
                      onClick={() => setActiveTab(2)}
                      icon={SettingsIcon}
                    >
                      Ver todas las respuestas
                    </Button>
                  </BlockStack>
                </Card>
              </Layout.Section>

              <Layout.Section>
                <Card>
                  <BlockStack gap="400">
                    <InlineStack align="space-between" blockAlign="center">
                      <Text as="h3" variant="headingMd">Tickets recientes</Text>
                      <Button
                        variant="plain"
                        onClick={() => setActiveTab(1)}
                        icon={ChatIcon}
                      >
                        Ver todos los tickets
                      </Button>
                    </InlineStack>
                    <DataTable
                      columnContentTypes={["text", "text", "text", "text", "text"]}
                      headings={["ID", "Cliente", "Motivo", "Fecha", "Estado"]}
                      rows={tickets.slice(0, 3).map(ticket => [
                        ticket.id,
                        ticket.customer,
                        ticket.reason,
                        ticket.date,
                        <Badge
                          tone={ticket.status === "resolved" ? "success" : ticket.status === "pending" ? "warning" : "attention"}
                        >
                          {ticket.status === "resolved" ? "Resuelto" : ticket.status === "pending" ? "Pendiente" : "Abierto"}
                        </Badge>
                      ])}
                    />
                  </BlockStack>
                </Card>
              </Layout.Section>
            </>
          )}

          {activeTab === 1 && (
            <Layout.Section>
              <Card>
                <BlockStack gap="400">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text as="h2" variant="headingMd">Tickets de soporte</Text>
                    <div style={{ width: "300px" }}>
                      <TextField
                        label="Buscar tickets"
                        placeholder="Buscar tickets..."
                        value={searchQuery}
                        onChange={setSearchQuery}
                        prefix={<Icon source={SearchIcon} />}
                        autoComplete="off"
                      />
                    </div>
                  </InlineStack>

                  {navigation.state === "loading" ? (
                    <div style={{ textAlign: "center", padding: "2rem" }}>
                      <Spinner size="large" />
                    </div>
                  ) : filteredTickets.length === 0 ? (
                    <EmptyState
                      heading="No se encontraron tickets"
                      image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                    >
                      <p>Intenta ajustar tu búsqueda o crear un nuevo ticket</p>
                    </EmptyState>
                  ) : (
                    <DataTable
                      columnContentTypes={["text", "text", "text", "text", "text"]}
                      headings={["ID", "Cliente", "Email", "Motivo", "Fecha", "Estado"]}
                      rows={filteredTickets.map(ticket => [
                        ticket.id,
                        ticket.customer,
                        ticket.email,
                        ticket.reason,
                        ticket.date,
                        <Badge
                          tone={ticket.status === "resolved" ? "success" : ticket.status === "pending" ? "warning" : "attention"}
                        >
                          {ticket.status === "resolved" ? "Resuelto" : ticket.status === "pending" ? "Pendiente" : "Abierto"}
                        </Badge>
                      ])}
                      pagination={{
                        hasNext: true,
                        onNext: () => {}
                      }}
                    />
                  )}
                </BlockStack>
              </Card>
            </Layout.Section>
          )}

          {activeTab === 2 && (
            <Layout.Section>
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">Configuración del Chatbot</Text>
                  
                  <Divider />
                  
                  <ChoiceList
                    title="Estado del Chatbot"
                    choices={[
                      { label: "Activo", value: "active" },
                      { label: "Inactivo", value: "inactive" }
                    ]}
                    selected={[config.status]}
                    onChange={(value) => setConfig({ ...config, status: value[0] })}
                  />

                  <TextField
                    label="Nombre del Chatbot"
                    value={config.name}
                    onChange={(value) => setConfig({ ...config, name: value })}
                    autoComplete="off"
                  />

                  <TextField
                    label="Mensaje de bienvenida"
                    value={config.welcomeMessage}
                    onChange={(value) => setConfig({ ...config, welcomeMessage: value })}
                    multiline={4}
                    autoComplete="off"
                  />

                  <Select
                    label="Personalidad del bot"
                    options={[
                      { label: "Amigable", value: "friendly" },
                      { label: "Profesional", value: "professional" },
                      { label: "Entusiasta", value: "enthusiastic" },
                      { label: "Directo", value: "direct" }
                    ]}
                    value={config.personality}
                    onChange={(value) => setConfig({ ...config, personality: value })}
                  />

                  <Divider />

                  <InlineStack align="space-between" blockAlign="center">
                    <Text as="h3" variant="headingSm">Horario de atención</Text>
                    <Button
                      variant="plain"
                      onClick={() => setActiveModal("schedule")}
                    >
                      Editar horario
                    </Button>
                  </InlineStack>

                  <Text as="p" variant="bodyMd">
                    {config.schedule.start} - {config.schedule.end} ({config.schedule.timezone})
                  </Text>

                  <Divider />

                  <InlineStack align="space-between" blockAlign="center">
                    <Text as="h3" variant="headingSm">Respuestas automáticas</Text>
                    <Button
                      variant="primary"
                      onClick={() => setActiveModal("new-response")}
                    >
                      Añadir respuesta
                    </Button>
                  </InlineStack>

                  {config.responses.length === 0 ? (
                    <EmptyState
                      heading="No hay respuestas configuradas"
                      image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                      action={{
                        content: "Crear primera respuesta",
                        onAction: () => setActiveModal("new-response")
                      }}
                    >
                      <p>Crea respuestas automáticas para preguntas frecuentes</p>
                    </EmptyState>
                  ) : (
                    <DataTable
                      columnContentTypes={["text", "text", "text"]}
                      headings={["Pregunta", "Respuesta", "Palabras clave"]}
                      rows={config.responses.map(response => [
                        response.question,
                        response.answer,
                        response.triggers.join(", ")
                      ])}
                    />
                  )}
                </BlockStack>
              </Card>
            </Layout.Section>
          )}
        </Layout>
      </Tabs>

      {/* Modal para nueva respuesta */}
      <Modal
        open={activeModal === "new-response"}
        onClose={() => setActiveModal(null)}
        title="Nueva respuesta automática"
        primaryAction={{
          content: "Guardar respuesta",
          onAction: addResponse,
          disabled: !newResponse.question || !newResponse.answer
        }}
        secondaryActions={[
          {
            content: "Cancelar",
            onAction: () => setActiveModal(null)
          }
        ]}
      >
        <Modal.Section>
          <BlockStack gap="400">
            <TextField
              label="Pregunta común"
              value={newResponse.question}
              onChange={(value) => setNewResponse({ ...newResponse, question: value })}
              placeholder="Ej: ¿Cuánto cuesta el envío?"
              autoComplete="off"
            />
            <TextField
              label="Respuesta"
              value={newResponse.answer}
              onChange={(value) => setNewResponse({ ...newResponse, answer: value })}
              multiline={4}
              placeholder="Ej: El envío es gratuito para compras mayores a $500"
              autoComplete="off"
            />
            <TextField
              label="Palabras clave (separadas por comas)"
              value={newResponse.triggers}
              onChange={(value) => setNewResponse({ ...newResponse, triggers: value })}
              placeholder="Ej: envío, costo envío, gratis"
              autoComplete="off"
              helpText="El chatbot responderá con esta respuesta cuando detecte estas palabras"
            />
          </BlockStack>
        </Modal.Section>
      </Modal>

      {/* Modal para horario */}
      <Modal
        open={activeModal === "schedule"}
        onClose={() => setActiveModal(null)}
        title="Configurar horario de atención"
        primaryAction={{
          content: "Guardar cambios",
          onAction: () => setActiveModal(null)
        }}
        secondaryActions={[
          {
            content: "Cancelar",
            onAction: () => setActiveModal(null)
          }
        ]}
      >
        <Modal.Section>
          <BlockStack gap="400">
            <InlineStack blockAlign="center" gap="400">
              <TextField
                label="Hora de inicio"
                type="time"
                value={config.schedule.start}
                onChange={(value) => setConfig({
                  ...config,
                  schedule: { ...config.schedule, start: value }
                })}
                autoComplete="off"
              />
              <TextField
                label="Hora de fin"
                type="time"
                value={config.schedule.end}
                onChange={(value) => setConfig({
                  ...config,
                  schedule: { ...config.schedule, end: value }
                })}
                autoComplete="off"
              />
            </InlineStack>
            <Select
              label="Zona horaria"
              options={[
                { label: "Ciudad de México", value: "America/Mexico_City" },
                { label: "Nueva York", value: "America/New_York" },
                { label: "Los Ángeles", value: "America/Los_Angeles" },
                { label: "Madrid", value: "Europe/Madrid" }
              ]}
              value={config.schedule.timezone}
              onChange={(value) => setConfig({
                ...config,
                schedule: { ...config.schedule, timezone: value }
              })}
            />
            <Checkbox
              label="Mostrar mensaje fuera de horario"
              checked={true}
              onChange={() => {}}
            />
          </BlockStack>
        </Modal.Section>
      </Modal>
    </Page>
  );
}