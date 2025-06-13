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
import { useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import db from "../db.server";

/* 
 * Loader para obtener datos iniciales
 * Simula una API con datos de configuración del chatbot,
 * métricas y tickets
 */
export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  // Primero obtener la tienda
  const shop = await db.shop.findUnique({
    where: {
      shop_domain: session.shop
    }
  });

  if (!shop) {
    return json({ 
      chatbotConfig: {
        bot_name: "",
        welcome_message: "",
        is_active: true
      },
      tickets: []
    });
  }

  // Obtener la configuración del chatbot
  const chatbotConfig = await db.chatbotConfiguration.findFirst({
    where: {
      shop_id: shop.id
    }
  }) || {
    bot_name: "",
    welcome_message: "",
    is_active: true
  };

  // Obtener los tickets de la base de datos
  const tickets = await db.ticket.findMany({
    where: {
      shop_id: shop.id
    },
    orderBy: {
      created_at: 'desc'
    },
    select: {
      id: true,
      customer_email: true,
      subject: true,
      status: true,
      created_at: true,
      message: true
    }
  });

  // Transformar los tickets al formato esperado por la interfaz
  const formattedTickets = tickets.map(ticket => ({
    id: ticket.id,
    customer: ticket.customer_email,
    email: ticket.customer_email,
    reason: ticket.subject,
    date: ticket.created_at.toISOString().split('T')[0],
    status: ticket.status
  }));

  return json({ 
    chatbotConfig, 
    tickets: formattedTickets 
  });
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const ticketId = formData.get("ticketId");
  const newStatus = formData.get("status");

  if (ticketId && newStatus) {
    await db.ticket.update({
      where: { id: ticketId },
      data: { status: newStatus }
    });
  }

  return json({ success: true });
};

/* 
 * Componente principal de la página del chatbot
 * Maneja la interfaz de usuario y la lógica del chatbot
 */
export default function ChatbotPage() {
  // Obtener datos del loader
  const { chatbotConfig, tickets } = useLoaderData();
  const navigation = useNavigation();
  const app = useAppBridge();
  const submit = useSubmit();

  // Estados del componente
  const [activeTab, setActiveTab] = useState(0);
  const [config, setConfig] = useState(chatbotConfig);
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = [
    {
      id: "configuration",
      content: "Configuración",
      panelID: "configuration-content"
    },
    {
      id: "tickets",
      content: "Tickets",
      panelID: "tickets-content"
    }
  ];

  const toggleStatus = () => {
    setConfig({
      ...config,
      status: config.status === "active" ? "inactive" : "active"
    });
  };

  const updateTicketStatus = (ticketId, newStatus) => {
    const formData = new FormData();
    formData.append("ticketId", ticketId);
    formData.append("status", newStatus);
    submit(formData, { method: "post" });
  };

  const getStatusBadge = (status, ticketId) => {
    const statusConfig = {
      PENDING: { tone: "warning", label: "Pendiente" },
      IN_PROGRESS: { tone: "info", label: "En Progreso" },
      RESOLVED: { tone: "success", label: "Resuelto" },
      CLOSED: { tone: "critical", label: "Cerrado" }
    };

    const config = statusConfig[status] || { tone: "attention", label: status };
    return (
      <Select
        label=""
        labelHidden
        options={getStatusOptions()}
        value={status}
        onChange={(value) => updateTicketStatus(ticketId, value)}
      />
    );
  };

  const getStatusOptions = () => {
    return [
      { label: "Pendiente", value: "PENDING" },
      { label: "En Progreso", value: "IN_PROGRESS" },
      { label: "Resuelto", value: "RESOLVED" },
      { label: "Cerrado", value: "CLOSED" }
    ];
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
    >
      <TitleBar title="Chatbot AI" />
      
      <Tabs
        tabs={tabs}
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
                    <BlockStack gap="400">
                      <TextField
                        label="Nombre del bot"
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
                    </BlockStack>
                  </Card>

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
                          getStatusBadge(ticket.status, ticket.id)
                        ])}
                      />
                    </BlockStack>
                  </Card>
                </BlockStack>
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
                        getStatusBadge(ticket.status, ticket.id)
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
        </Layout>
      </Tabs>
    </Page>
  );
}