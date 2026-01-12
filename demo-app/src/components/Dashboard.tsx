import { Paper, Title, SimpleGrid, Group, Text, Button, Badge, Card, RingProgress, Timeline, ThemeIcon, Accordion, Grid, Center, Stack, Table, ActionIcon, Tooltip, Modal, Code, CopyButton } from '@mantine/core';
import { useSCSEStore } from '../core/store';
import { ClearingEngine } from '../core/engine';
import { ISO20022Generator } from '../core/iso20022';
import { IconPlus, IconBuildingBank, IconTrendingUp, IconActivity, IconInfoCircle, IconCheck, IconX, IconFileCode, IconDownload, IconCopy, IconArrowUpRight } from '@tabler/icons-react';
import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';

export function Dashboard() {
    const { participants, payments } = useSCSEStore();
    const [loading, setLoading] = useState(false);

    // Modal State
    const [opened, { open, close }] = useDisclosure(false);
    const [selectedXml, setSelectedXml] = useState('');
    const [selectedPaymentId, setSelectedPaymentId] = useState('');

    const totalVolume = payments.reduce((acc, p) => acc + p.amount, 0);
    const clearedCount = payments.filter(p => p.status === 'CLEARED').length;
    const settledCount = payments.filter(p => p.status === 'SETTLED' || p.status === 'NETTED').length;

    const sendRandomPayment = async () => {
        setLoading(true);
        const from = participants[Math.floor(Math.random() * participants.length)];
        let to = participants[Math.floor(Math.random() * participants.length)];
        while (to.id === from.id) to = participants[Math.floor(Math.random() * participants.length)];

        await ClearingEngine.submitPayment({
            instructionId: `TX-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            debtorAgent: from.id,
            creditorAgent: to.id,
            amount: Math.floor(Math.random() * 500) + 10,
            currency: 'USDC'
        });
        setLoading(false);
    };

    const handleExport = (payment: any) => {
        const xml = ISO20022Generator.generatePacs008(payment);
        setSelectedXml(xml);
        setSelectedPaymentId(payment.id);
        open();
    };

    const handleDownload = () => {
        const blob = new Blob([selectedXml], { type: 'text/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pacs.008.${selectedPaymentId}.xml`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <Stack gap="lg">
            <Group justify="space-between" align="center">
                <div>
                    <Title order={2}>Network Overview</Title>
                    <Text c="dimmed">Real-time clearing and liquidity monitoring.</Text>
                </div>
                <Button leftSection={<IconPlus size={16} />} onClick={sendRandomPayment} loading={loading} color="cyan">
                    Simulate New Transaction
                </Button>
            </Group>

            <SimpleGrid cols={{ base: 1, md: 3 }}>
                <Card padding="lg" radius="md">
                    <Group>
                        <RingProgress
                            size={80}
                            roundCaps
                            thickness={8}
                            sections={[{ value: 100, color: 'blue' }]}
                            label={<Center><IconBuildingBank size={20} /></Center>}
                        />
                        <div>
                            <Text c="dimmed" size="xs" tt="uppercase" fw={700}>System Balance</Text>
                            <Text fw={700} size="xl">${participants.reduce((a, b) => a + b.balance, 0).toLocaleString()}</Text>
                            <Text size="xs" c="green" fw={500}>100% Fully Reserved</Text>
                        </div>
                    </Group>
                </Card>
                <Card padding="lg" radius="md">
                    <Group>
                        <RingProgress
                            size={80}
                            roundCaps
                            thickness={8}
                            sections={[{ value: (settledCount / payments.length) * 100 || 0, color: 'teal' }]}
                            label={<Center><IconCheck size={20} /></Center>}
                        />
                        <div>
                            <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Processed Volume</Text>
                            <Text fw={700} size="xl">${totalVolume.toLocaleString()}</Text>
                            <Text size="xs" c="dimmed">Across {payments.length} txs</Text>
                        </div>
                    </Group>
                </Card>
                <Card padding="lg" radius="md">
                    <Group>
                        <ThemeIcon size={80} radius="100%" color="orange" variant="light">
                            <IconActivity size={40} />
                        </ThemeIcon>
                        <div>
                            <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Clearing Queue</Text>
                            <Text fw={700} size="xl">{clearedCount}</Text>
                            <Text size="xs" c="orange">Ready for Netting</Text>
                        </div>
                    </Group>
                </Card>
            </SimpleGrid>

            {/* Split View: Timeline Feed (Left) + How It Works (Right Right) -> Changed to Top/Bottom for Table */}

            <Grid>
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Card title="Live Activity" h="100%">
                        <Title order={4} mb="lg">Live Clearing Feed</Title>
                        {payments.length === 0 ? (
                            <Center h={200} bg="gray.0" style={{ borderRadius: 8 }}>
                                <Text c="dimmed">No transactions yet. Click "Simulate" above.</Text>
                            </Center>
                        ) : (
                            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                                <Timeline active={payments.length} bulletSize={24} lineWidth={2}>
                                    {payments.slice(0, 5).map((p) => (
                                        <Timeline.Item
                                            key={p.instructionId}
                                            bullet={p.status === 'REJECTED' ? <IconX size={12} /> : <IconCheck size={12} />}
                                            color={p.status === 'REJECTED' ? 'red' : p.status === 'NETTED' ? 'grape' : p.status === 'CLEARED' ? 'blue' : 'green'}
                                            title={<Text size="sm" fw={500}>Payment <Text span ff="monospace" c="dimmed">{p.instructionId}</Text></Text>}
                                        >
                                            <Text c="dimmed" size="xs" mt={4}>
                                                <b>{p.debtorAgent}</b> sent <b>${p.amount}</b> to <b>{p.creditorAgent}</b>
                                            </Text>
                                        </Timeline.Item>
                                    ))}
                                </Timeline>
                            </div>
                        )}
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card h="100%" bg="gray.0">
                        <Group mb="md">
                            <IconInfoCircle size={20} />
                            <Text fw={700}>How it Works</Text>
                        </Group>
                        <Accordion variant="separated" defaultValue="clearing">
                            <Accordion.Item value="clearing">
                                <Accordion.Control>1. Real-Time Clearing</Accordion.Control>
                                <Accordion.Panel text="sm" c="dimmed">Payments are validated individually. Funds Reserved.</Accordion.Panel>
                            </Accordion.Item>
                            <Accordion.Item value="netting">
                                <Accordion.Control>2. Multilateral Netting</Accordion.Control>
                                <Accordion.Panel text="sm" c="dimmed">Aggregates "Cleared" payments to reduce liquidity needs.</Accordion.Panel>
                            </Accordion.Item>
                            <Accordion.Item value="settlement">
                                <Accordion.Control>3. Final Settlement</Accordion.Control>
                                <Accordion.Panel text="sm" c="dimmed">Net obligations settled on Blockchain.</Accordion.Panel>
                            </Accordion.Item>
                        </Accordion>
                    </Card>
                </Grid.Col>
            </Grid>

            {/* Transaction Ledger Table with Export */}
            <Card>
                <Title order={4} mb="md">Transaction Ledger (ISO 20022 Ready)</Title>
                <Table>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Timestamp</Table.Th>
                            <Table.Th>ID</Table.Th>
                            <Table.Th>From → To</Table.Th>
                            <Table.Th>Amount</Table.Th>
                            <Table.Th>Status</Table.Th>
                            <Table.Th>Action</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {payments.slice().reverse().slice(0, 10).map((payment) => (
                            <Table.Tr key={payment.id}>
                                <Table.Td>
                                    <Text size="xs" c="dimmed">{new Date(payment.timestamp || Date.now()).toLocaleTimeString()}</Text>
                                </Table.Td>
                                <Table.Td><Text size="xs" ff="monospace">{payment.id ? payment.id.slice(0, 8) : payment.instructionId.slice(0, 8)}</Text></Table.Td>
                                <Table.Td>
                                    <Group gap="xs">
                                        <Badge size="sm" variant="dot" color="gray">{payment.debtorAgent}</Badge>
                                        <IconArrowUpRight size={14} color="gray" />
                                        <Badge size="sm" variant="dot" color="gray">{payment.creditorAgent}</Badge>
                                    </Group>
                                </Table.Td>
                                <Table.Td fw={700}>${payment.amount.toLocaleString()}</Table.Td>
                                <Table.Td>
                                    <Badge
                                        color={payment.status === 'SETTLED' ? 'green' : payment.status === 'CLEARED' ? 'blue' : 'gray'}
                                        variant="light"
                                    >
                                        {payment.status}
                                    </Badge>
                                </Table.Td>
                                <Table.Td>
                                    <Tooltip label="Export ISO 20022 XML">
                                        <ActionIcon variant="subtle" color="blue" onClick={() => handleExport(payment)}>
                                            <IconFileCode size={18} />
                                        </ActionIcon>
                                    </Tooltip>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </Card>

            <Modal opened={opened} onClose={close} title={<Group><IconFileCode size={20} /><Text fw={700}>ISO 20022 Export (pacs.008)</Text></Group>} size="lg">
                <Text size="xs" c="dimmed" mb="md">
                    Generated standard Customer Credit Transfer message. This output is compatible with SWIFT CBPR+ and SEPA inst.
                </Text>
                <Paper p="xs" bg="gray.1" withBorder style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <Code block style={{ whiteSpace: 'pre-wrap', fontSize: '11px' }}>{selectedXml}</Code>
                </Paper>
                <Group justify="flex-end" mt="md">
                    <CopyButton value={selectedXml}>
                        {({ copied, copy }) => (
                            <Button color={copied ? 'teal' : 'gray'} variant="light" onClick={copy} leftSection={copied ? <IconCheck size={16} /> : <IconCopy size={16} />}>
                                {copied ? 'Copied' : 'Copy Code'}
                            </Button>
                        )}
                    </CopyButton>
                    <Button leftSection={<IconDownload size={16} />} onClick={handleDownload} variant="filled" color="indigo">
                        Download .xml
                    </Button>
                </Group>
            </Modal>
        </Stack>
    )
}
