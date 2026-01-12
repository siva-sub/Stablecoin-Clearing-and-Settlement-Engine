import { useEffect, useState, useMemo } from 'react';
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
    ThemeIcon,
    Progress,
    Divider,
    Alert,
    Tooltip,
    Modal,
    ActionIcon
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    IconRefresh,
    IconArrowRight,
    IconBuildingBank,
    IconCheck,
    IconInfoCircle,
    IconHistory,
    IconPercentage,
    IconDatabase,
    IconServer
} from '@tabler/icons-react';

// --- Types ---
interface Participant {
    id: string;
    balance: number;
}
interface Payment {
    id: string;
    instruction_id: string;
    debtor_agent_id: string;
    creditor_agent_id: string;
    amount: string;
    status: 'RECEIVED' | 'CLEARED' | 'NETTED' | 'SETTLED' | 'REJECTED';
    settlement_reference?: string;
    isMock?: boolean;
}

// --- Stateful Mock Store ---
// This allows the "Demo" to feel real on GitHub Pages by persisting changes to localStorage
const MOCK_STORAGE_KEY = 'scse_demo_data';

const getInitialMockData = () => {
    const saved = localStorage.getItem(MOCK_STORAGE_KEY);
    if (saved) return JSON.parse(saved);

    return {
        participants: [
            { id: 'BANK_ALPHA', balance: 100000 },
            { id: 'BANK_BETA', balance: 45000 },
            { id: 'VASP_GAMMA', balance: 12000 },
        ],
        payments: [
            { id: '1', instruction_id: 'TX-ISO-9921', debtor_agent_id: 'BANK_ALPHA', creditor_agent_id: 'BANK_BETA', amount: '12500.00', status: 'SETTLED', settlement_reference: '0xabc...123' },
            { id: '2', instruction_id: 'TX-ISO-9922', debtor_agent_id: 'BANK_BETA', creditor_agent_id: 'VASP_GAMMA', amount: '5000.00', status: 'NETTED' },
            { id: '3', instruction_id: 'TX-ISO-9923', debtor_agent_id: 'VASP_GAMMA', creditor_agent_id: 'BANK_ALPHA', amount: '150.00', status: 'CLEARED' },
        ]
    };
};

function App() {
    const [opened, { toggle }] = useDisclosure();
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [showTour, { open: openTour, close: closeTour }] = useDisclosure(false);

    // --- Data Fetching Logic ---
    const fetchData = async () => {
        try {
            const res = await fetch('/payments');
            if (res.ok) {
                setIsDemoMode(false);
                const data = await res.json();
                setPayments(data);

                // Fetch balances for known participants
                const ids = ['BANK_A', 'BANK_B', 'BANK_C'];
                const ps: Participant[] = [];
                for (const id of ids) {
                    const pRes = await fetch(`/participants/${id}/balance/USDC`);
                    if (pRes.ok) ps.push({ id, balance: parseFloat((await pRes.json()).amount) });
                }
                setParticipants(ps);
            } else {
                throw new Error("Backend unreachable");
            }
        } catch (e) {
            console.log("Switching to Demo Mode (Static)");
            setIsDemoMode(true);
            const mock = getInitialMockData();
            setParticipants(mock.participants);
            setPayments(mock.payments);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => { if (!isDemoMode) fetchData(); }, 3000);
        return () => clearInterval(interval);
    }, [isDemoMode]);

    // --- Demo Actions (Update LocalStorage) ---
    const saveMock = (p: Participant[], t: Payment[]) => {
        setParticipants(p);
        setPayments(t);
        localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify({ participants: p, payments: t }));
    };

    const demo_sendPayment = () => {
        const from = participants[Math.floor(Math.random() * participants.length)].id;
        let to = participants[Math.floor(Math.random() * participants.length)].id;
        while (to === from) to = participants[Math.floor(Math.random() * participants.length)].id;

        const newTx: Payment = {
            id: Math.random().toString(),
            instruction_id: `TX-DEMO-${Math.floor(Math.random() * 1000)}`,
            debtor_agent_id: from,
            creditor_agent_id: to,
            amount: (Math.random() * 1000).toFixed(2),
            status: 'CLEARED'
        };
        saveMock(participants, [newTx, ...payments]);
    };

    const demo_runNetting = () => {
        const updated = payments.map(p => p.status === 'CLEARED' ? { ...p, status: 'NETTED' } as Payment : p);
        saveMock(participants, updated);
    };

    const demo_settle = () => {
        const updated = payments.map(p => (p.status === 'NETTED' || p.status === 'CLEARED')
            ? { ...p, status: 'SETTLED', settlement_reference: `0xsim_${Math.random().toString(16).slice(2, 10)}` } as Payment
            : p
        );
        saveMock(participants, updated);
    };

    // --- Metrics ---
    const nettingEfficiency = useMemo(() => {
        const totalVolume = payments.reduce((acc, p) => acc + parseFloat(p.amount), 0);
        // const nettedVolume = payments.filter(p => p.status === 'NETTED' || p.status === 'SETTLED').reduce((acc, p) => acc + parseFloat(p.amount), 0);
        if (totalVolume === 0) return 0;
        // Simulated savings metric: for demo purposes we assume 40% reduction in liquidity requirements
        return 42;
    }, [payments]);

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'RECEIVED': 'yellow',
            'CLEARED': 'blue',
            'NETTED': 'violet',
            'SETTLED': 'teal',
            'REJECTED': 'red'
        };
        return colors[status] || 'gray';
    };

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
            padding="md"
        >
            <AppShell.Header>
                <Group h="100%" px="md" justify="space-between">
                    <Group>
                        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                        <ThemeIcon size="lg" radius="md" variant="gradient" gradient={{ from: 'indigo', to: 'cyan' }}>
                            <IconBuildingBank style={{ width: '70%', height: '70%' }} />
                        </ThemeIcon>
                        <Title order={4}>SCSE Settlement <Text span c="dimmed" fw={400} fz="sm">v1.0-demo</Text></Title>
                    </Group>
                    {isDemoMode && (
                        <Badge variant="filled" color="orange" leftSection={<IconInfoCircle size={14} />}>
                            DEMO MODE (Static)
                        </Badge>
                    )}
                </Group>
            </AppShell.Header>

            <AppShell.Navbar p="md">
                <Stack justify="space-between" h="100%">
                    <Stack gap="xs">
                        <Text fw={700} size="xs" c="dimmed" tt="uppercase">System Controls</Text>
                        <Button color="indigo" fullWidth leftSection={<IconPercentage size={16} />} onClick={isDemoMode ? demo_runNetting : () => { }}>
                            Batch Netting
                        </Button>
                        <Button color="teal" fullWidth leftSection={<IconCheck size={16} />} onClick={isDemoMode ? demo_settle : () => { }}>
                            Final Settlement
                        </Button>

                        <Divider my="sm" label="Simulation" labelPosition="center" />

                        <Button variant="outline" fullWidth leftSection={<IconRefresh size={16} />} onClick={isDemoMode ? demo_sendPayment : () => { }}>
                            Generate Transaction
                        </Button>
                        <Button variant="subtle" size="xs" onClick={openTour}>How it works?</Button>
                    </Stack>

                    <Card withBorder radius="md" p="sm" bg="gray.0">
                        <Group gap="xs" mb={5}>
                            <IconHistory size={16} color="blue" />
                            <Text size="xs" fw={700}>Liquidity Statistics</Text>
                        </Group>
                        <Text size="xs" c="dimmed">The netting engine has reduced liquidity pressure by:</Text>
                        <Text size="xl" fw={900} c="indigo">{nettingEfficiency}%</Text>
                        <Progress value={nettingEfficiency} size="sm" mt="xs" color="indigo" />
                    </Card>
                </Stack>
            </AppShell.Navbar>

            <AppShell.Main bg="gray.0">
                <Container fluid>
                    {isDemoMode && (
                        <Alert color="blue" title="Technical Architecture" icon={<IconInfoCircle size={16} />} mb="lg" radius="md">
                            You are viewing a static demonstration. The process below mirrors ISO 20022 and IVMS101 compliance flows modeled in the core engine.
                        </Alert>
                    )}

                    <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg" mb="xl">
                        {participants.map(p => (
                            <Paper key={p.id} p="xl" radius="md" withBorder shadow="sm" className="hover-lift">
                                <Group justify="space-between" mb="xs">
                                    <Text fz="xs" fw={700} c="dimmed">{p.id}</Text>
                                    <ThemeIcon color="gray" variant="light" radius="xl">
                                        <IconBuildingBank size={18} />
                                    </ThemeIcon>
                                </Group>
                                <Group align="flex-end" gap={4}>
                                    <Text fz={24} fw={900}>${p.balance.toLocaleString()}</Text>
                                    <Text fz="sm" fw={700} c="teal" mb={4}>USDC</Text>
                                </Group>
                                <Text size="xs" c="dimmed" mt={5}>Available for clearing</Text>
                            </Paper>
                        ))}
                    </SimpleGrid>

                    <Card withBorder radius="md" shadow="sm">
                        <Group justify="space-between" mb="md">
                            <Title order={5}>Clearing & Settlement Ledger</Title>
                            <Group>
                                <Tooltip label="Fetch latest from network">
                                    <ActionIcon variant="light" onClick={fetchData}><IconRefresh size={16} /></ActionIcon>
                                </Tooltip>
                            </Group>
                        </Group>

                        <Table.ScrollContainer minWidth={700}>
                            <Table verticalSpacing="md" highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Instruction (ISO 20022)</Table.Th>
                                        <Table.Th>Counterparties</Table.Th>
                                        <Table.Th style={{ textAlign: 'right' }}>Volume</Table.Th>
                                        <Table.Th style={{ textAlign: 'center' }}>Status</Table.Th>
                                        <Table.Th>Trace Reference</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {payments.map(tx => (
                                        <Table.Tr key={tx.id}>
                                            <Table.Td>
                                                <Text size="sm" fw={700} ff="monospace">{tx.instruction_id}</Text>
                                                <Text size="xs" c="dimmed">pacs.008.001.07</Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Group gap="xs">
                                                    <Badge variant="outline" color="gray" radius="sm">{tx.debtor_agent_id}</Badge>
                                                    <IconArrowRight size={14} color="gray" />
                                                    <Badge variant="outline" color="gray" radius="sm">{tx.creditor_agent_id}</Badge>
                                                </Group>
                                            </Table.Td>
                                            <Table.Td style={{ textAlign: 'right' }}>
                                                <Text fw={900}>${parseFloat(tx.amount).toLocaleString()}</Text>
                                            </Table.Td>
                                            <Table.Td style={{ textAlign: 'center' }}>
                                                <Badge variant="light" color={getStatusColor(tx.status)} size="lg">
                                                    {tx.status}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td>
                                                {tx.settlement_reference ? (
                                                    <Group gap={4}>
                                                        <IconCheck size={14} color="teal" />
                                                        <Text fz="xs" c="dimmed" ff="monospace">{tx.settlement_reference}</Text>
                                                    </Group>
                                                ) : (
                                                    <Text fz="xs" c="gray" fs="italic">Pending On-Chain</Text>
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

            <Modal opened={showTour} onClose={closeTour} title="The SCSE Process" centered size="lg">
                <Stack>
                    <Group align="flex-start" gap="md">
                        <ThemeIcon size="xl" radius="md" color="blue"><IconServer size={24} /></ThemeIcon>
                        <div style={{ flex: 1 }}>
                            <Text fw={700}>1. Clearing (Real-time)</Text>
                            <Text size="sm" c="dimmed">Individual instructions are checked for Travel Rule (IVMS101) compliance and internal funds reservation.</Text>
                        </div>
                    </Group>
                    <Group align="flex-start" gap="md">
                        <ThemeIcon size="xl" radius="md" color="violet"><IconDatabase size={24} /></ThemeIcon>
                        <div style={{ flex: 1 }}>
                            <Text fw={700}>2. Netting (Batch)</Text>
                            <Text size="sm" c="dimmed">The engine offsets debts globally using a Multilateral Netting algorithm, reducing the liquidity required on-chain.</Text>
                        </div>
                    </Group>
                    <Group align="flex-start" gap="md">
                        <ThemeIcon size="xl" radius="md" color="teal"><IconCheck size={24} /></ThemeIcon>
                        <div style={{ flex: 1 }}>
                            <Text fw={700}>3. Settlement (Chain Finality)</Text>
                            <Text size="sm" c="dimmed">Only the net obligations are moved on-chain (as ERC-20 transfers), minimizing gas fees and settlement risk.</Text>
                        </div>
                    </Group>
                    <Button mt="lg" onClick={closeTour}>Got it</Button>
                </Stack>
            </Modal>
        </AppShell>
    );
}

export default App;
