import { Paper, Title, SimpleGrid, Group, Text, Button, Badge, Card, RingProgress, Timeline, ThemeIcon, Accordion, Grid, Center, Stack } from '@mantine/core';
import { useSCSEStore } from '../core/store';
import { ClearingEngine } from '../core/engine';
import { IconPlus, IconBuildingBank, IconTrendingUp, IconActivity, IconInfoCircle, IconCheck, IconX } from '@tabler/icons-react';
import { useState } from 'react';

export function Dashboard() {
    const { participants, payments } = useSCSEStore();
    const [loading, setLoading] = useState(false);

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

            <Grid>
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Card title="Live Activity" h="100%">
                        <Title order={4} mb="lg">Live Clearing Feed</Title>
                        {payments.length === 0 ? (
                            <Center h={200} bg="gray.0" style={{ borderRadius: 8 }}>
                                <Text c="dimmed">No transactions yet. Click "Simulate" above.</Text>
                            </Center>
                        ) : (
                            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                                <Timeline active={payments.length} bulletSize={24} lineWidth={2}>
                                    {payments.slice(0, 10).map((p) => (
                                        <Timeline.Item
                                            key={p.instructionId}
                                            bullet={
                                                p.status === 'REJECTED' ? <IconX size={12} /> :
                                                    p.status === 'NETTED' ? <IconActivity size={12} /> :
                                                        <IconCheck size={12} />
                                            }
                                            color={
                                                p.status === 'REJECTED' ? 'red' :
                                                    p.status === 'NETTED' ? 'grape' :
                                                        p.status === 'CLEARED' ? 'blue' : 'green'
                                            }
                                            title={
                                                <Text size="sm" fw={500}>
                                                    Payment <Text span ff="monospace" c="dimmed">{p.instructionId}</Text>
                                                </Text>
                                            }
                                        >
                                            <Text c="dimmed" size="xs" mt={4}>
                                                <b>{p.debtorAgent}</b> sent <b>${p.amount}</b> to <b>{p.creditorAgent}</b>
                                            </Text>
                                            <Badge size="xs" mt={4} variant="light" color={
                                                p.status === 'REJECTED' ? 'red' :
                                                    p.status === 'NETTED' ? 'grape' :
                                                        p.status === 'CLEARED' ? 'blue' : 'green'
                                            }>{p.status}</Badge>
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
                                <Accordion.Panel text="sm" c="dimmed">
                                    Payments are validated individually (Schema, Compliance, Funds).
                                    Funds are <b>Reserved</b> immediately, but not settled on-chain yet.
                                </Accordion.Panel>
                            </Accordion.Item>
                            <Accordion.Item value="netting">
                                <Accordion.Control>2. Multilateral Netting</Accordion.Control>
                                <Accordion.Panel text="sm" c="dimmed">
                                    The engine aggregates "Cleared" payments.
                                    Example: If A owes B $100, and B owes A $90, only $10 needs to move.
                                </Accordion.Panel>
                            </Accordion.Item>
                            <Accordion.Item value="settlement">
                                <Accordion.Control>3. Final Settlement</Accordion.Control>
                                <Accordion.Panel text="sm" c="dimmed">
                                    Net obligations are settled on the underlying ledger (e.g., Blockchain), finalizing the transaction.
                                </Accordion.Panel>
                            </Accordion.Item>
                        </Accordion>
                    </Card>
                </Grid.Col>
            </Grid>
        </Stack>
    )
}
