import {
  Box,
  Card,
  Layout,
  Link,
  List,
  Page,
  Text,
  BlockStack,
  Button
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

export default function Pricing() {
  return (
    <Page>
      <TitleBar title="Planes de Suscripción" />
      <div style={{
        maxWidth: '800px',
        margin: '2rem auto',
        padding: '0 2rem',
      }}>
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <Text as="h2" variant="headingMd">
                  Elige el plan perfecto para tu negocio
                </Text>
                <Layout>
                  {/* Plan de $50 */}
                  <Layout.Section variant="oneThird">
                    <Card>
                      <BlockStack gap="300">
                        <Text as="h3" variant="headingLg">
                          Plan Pro
                        </Text>
                        <Text as="p" variant="bodyMd">
                          Ideal para negocios en crecimiento
                        </Text>
                        <Text as="p" variant="heading2xl">
                          $50
                          <Text as="span" variant="bodyMd"> / mes</Text>
                        </Text>
                        <List>
                          <List.Item>Verificación de pedidos ilimitada</List.Item>
                          <List.Item>Acceso completo a métricas</List.Item>
                          <List.Item>Soporte prioritario</List.Item>
                          {/* Añadir más características si aplica */}
                        </List>
                        <Button primary fullWidth>
                          Seleccionar Plan
                        </Button>
                      </BlockStack>
                    </Card>
                  </Layout.Section>
                </Layout>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </div>
    </Page>
  );
}

function Code({ children }) {
  return (
    <Box
      as="span"
      padding="025"
      paddingInlineStart="100"
      paddingInlineEnd="100"
      background="bg-surface-active"
      borderWidth="025"
      borderColor="border"
      borderRadius="100"
    >
      <code>{children}</code>
    </Box>
  );
}
