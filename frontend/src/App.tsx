import { useEffect, useState } from 'react';
import {
  AppShell,
  Burger,
  Group,
  Text,
  Title,
  Button,
  Table,
  Badge,
  Card,
  SimpleGrid,
  Container,
  Paper,

  Stack,
  ThemeIcon
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconRefresh, IconArrowRight, IconBuildingBank, IconCheck } from '@tabler/icons-react';

// Types matching backend
interface Participant {
  id: string;
  balance: number;
}
interface Payment {
  instruction_id: string;
  debtor_agent_id: string;
  creditor_agent_id: string;
  amount: string;
  currency: string;
  status: string;
  settlement_reference?: string;
}



function App() {
  const [opened, { toggle }] = useDisclosure();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const fetchData = async () => {
    try {
      // 1. Fetch Balances (Simulated by probing known IDs for MVP)
      const ids = ['BANK_A', 'BANK_B', 'BANK_C'];
      const ps: Participant[] = [];
      for (const id of ids) {
        try {
          const res = await fetch(`/participants/${id}/balance/USDC`);
          if (res.ok) {
            const data = await res.json();
            ps.push({ id, balance: parseFloat(data.amount) });
          }
        } catch (e) { console.error(e) }
      }
      if (ps.length > 0) setParticipants(ps);

      // 2. Fetch Payments
      const res2 = await fetch('/payments');
      if (res2.ok) {
        const data = await res2.json();
        setPayments(data);
      }
    } catch (error) {
      console.log("API not reachable, using placeholders", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  const triggerAction = async (endpoint: string) => {
    await fetch(endpoint, { method: 'POST' });
    fetchData();
  };

  const seedData = async () => {
    await fetch(`/participants?id=BANK_A&name=BankA`, { method: 'POST' });
    await fetch(`/participants?id=BANK_B&name=BankB`, { method: 'POST' });
    await fetch(`/participants?id=BANK_C&name=BankC`, { method: 'POST' });
    await fetch(`/participants/BANK_A/deposit?amount=1000&currency=USDC`, { method: 'POST' });
    await fetch(`/participants/BANK_B/deposit?amount=1000&currency=USDC`, { method: 'POST' });
    await fetch(`/participants/BANK_C/deposit?amount=1000&currency=USDC`, { method: 'POST' });
    fetchData();
  };

  const sendRandomPayment = async () => {
    const from = ['BANK_A', 'BANK_B', 'BANK_C'][Math.floor(Math.random() * 3)];
    let to = ['BANK_A', 'BANK_B', 'BANK_C'][Math.floor(Math.random() * 3)];
    while (to === from) to = ['BANK_A', 'BANK_B', 'BANK_C'][Math.floor(Math.random() * 3)];

    await fetch('/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instructionId: `TX-${Date.now().toString().slice(-6)}`,
        debtorAgent: { agentId: from },
        creditorAgent: { agentId: to },
        amount: (Math.random() * 100).toFixed(2),
        currency: 'USDC',
        valueDate: '2023-10-01'
      })
    });
    fetchData();
  };

  // Status Badge Helper
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RECEIVED': return 'yellow';
      case 'CLEARED': return 'blue';
      case 'NETTED': return 'violet';
      case 'SETTLED': return 'green';
      case 'REJECTED': return 'red';
      default: return 'gray';
    }
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <ThemeIcon size="lg" radius="md" variant="gradient" gradient={{ from: 'indigo', to: 'cyan' }}>
            <IconBuildingBank style={{ width: '70%', height: '70%' }} />
          </ThemeIcon>
          <Text fw={700} fz="xl">SCSE <Text span c="dimmed" inherit fw={400}>Dashboard</Text></Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack>
          <Button variant="light" leftSection={<IconRefresh size={14} />} onClick={fetchData}>Refresh Data</Button>

          <Text fw={600} fz="sm" c="dimmed" mt="md">CONTROLS</Text>
          <Button color="indigo" onClick={() => triggerAction('/netting/run')}>Run Netting Cycle</Button>
          <Button color="green" onClick={() => triggerAction('/settlement/process-rtgs')}>Settle Cleared (RTGS)</Button>

          <Text fw={600} fz="sm" c="dimmed" mt="md">DEBUG</Text>
          <Button variant="default" size="xs" onClick={seedData}>Seed Participants</Button>
          <Button variant="default" size="xs" onClick={sendRandomPayment}>Send Random Tx</Button>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main bg="gray.0">
        <Container fluid>
          <Title order={3} mb="lg">Liquidity Overview</Title>

          {/* Balances Grid */}
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg" mb={30}>
            {participants.length ? participants.map(p => (
              <Paper key={p.id} shadow="xs" p="xl" radius="md" withBorder>
                <Group justify="space-between" mb="xs">
                  <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Participant</Text>
                  <ThemeIcon variant="light" color="gray">
                    <IconBuildingBank size={16} />
                  </ThemeIcon>
                </Group>
                <Text fw={700} fz="xl" mb="xs">{p.id}</Text>
                <Group align="flex-end" gap="xs">
                  <Text fz="h2" fw={700} lh={1}>
                    ${p.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </Text>
                  <Text c="teal" fz="sm" fw={700} mb={2}>USDC</Text>
                </Group>
              </Paper>
            )) : (
              <Text c="dimmed">No participants found. Click 'Seed Participants'.</Text>
            )}
          </SimpleGrid>

          <Title order={3} mb="lg">Recent Transactions</Title>

          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Table.ScrollContainer minWidth={800}>
              <Table verticalSpacing="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Instruction ID</Table.Th>
                    <Table.Th>Flow</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>Amount</Table.Th>
                    <Table.Th style={{ textAlign: 'center' }}>Status</Table.Th>
                    <Table.Th>Settlement Ref</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {payments.map((tx) => (
                    <Table.Tr key={tx.instruction_id}>
                      <Table.Td>
                        <Text fz="sm" fw={500} style={{ fontFamily: 'monospace' }}>{tx.instruction_id}</Text>
                        <Text fz="xs" c="dimmed">{tx.status === 'NETTED' ? 'Via Netting Cycle' : 'Direct Transfer'}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <Badge variant="dot" color="gray" size="lg">{tx.debtor_agent_id}</Badge>
                          <IconArrowRight size={14} color="gray" />
                          <Badge variant="dot" color="gray" size="lg">{tx.creditor_agent_id}</Badge>
                        </Group>
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right' }}>
                        <Text fw={700}>${parseFloat(tx.amount).toFixed(2)}</Text>
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'center' }}>
                        <Badge color={getStatusColor(tx.status)} variant="light" size="lg">
                          {tx.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        {tx.settlement_reference ? (
                          <Group gap={4}>
                            <IconCheck size={14} color="green" />
                            <Text fz="xs" style={{ fontFamily: 'monospace' }} c="dimmed">{tx.settlement_reference}</Text>
                          </Group>
                        ) : (
                          <Text fz="xs" c="dimmed">-</Text>
                        )}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Card>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
