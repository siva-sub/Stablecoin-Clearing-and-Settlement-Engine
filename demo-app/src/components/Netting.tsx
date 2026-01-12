import { Paper, Title, Button, Table, Badge, Card, Text, Group, Alert, Grid, Progress, List, ThemeIcon } from '@mantine/core';
import { useSCSEStore } from '../core/store';
import { NettingEngine, SettlementManager } from '../core/engine';
import { IconArrowsShuffle, IconCheck, IconCalculator, IconScale, IconReceipt } from '@tabler/icons-react';
import { useState } from 'react';

export function Netting() {
    const { cycles, payments } = useSCSEStore();
    const [loading, setLoading] = useState(false);

    const clearedPayments = payments.filter(p => p.status === 'CLEARED');
    const clearedVolume = clearedPayments.reduce((a, b) => a + b.amount, 0);

    const runCycle = async () => {
        setLoading(true);
        await NettingEngine.runCycle();
        setLoading(false);
    };

    const settleCycle = async (id: string) => {
        setLoading(true);
        await SettlementManager.processCycle(id);
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            {/* Control Panel */}
            <Paper p="xl" radius="md" shadow="sm" withBorder bg="indigo.0">
                <Grid align="center">
                    <Grid.Col span={8}>
                        <Title order={3} c="indigo.9">Multilateral Netting Engine</Title>
                        <Text c="indigo.7" mb="md" mt="xs">
                            Aggregates all <b>{clearedPayments.length}</b> pending cleared payments (Gross: ${clearedVolume.toLocaleString()}) and reduces them to a minimal set of settlement obligations.
                        </Text>
                        <Group>
                            <Badge size="lg" color="indigo" variant="white">{clearedPayments.length} Pending Txs</Badge>
                            <Badge size="lg" color="cyan" variant="white">${clearedVolume.toLocaleString()} Gross Value</Badge>
                        </Group>
                    </Grid.Col>
                    <Grid.Col span={4} style={{ textAlign: 'right' }}>
                        <Button
                            size="xl" color="indigo"
                            leftSection={<IconCalculator />}
                            onClick={runCycle}
                            loading={loading}
                            disabled={clearedPayments.length === 0}
                            fullWidth
                        >
                            Calculate Net Positions
                        </Button>
                    </Grid.Col>
                </Grid>
            </Paper>

            {/* Cycle History */}
            <Title order={4} mt="xl" mb="md">Netting Cycles (Newest First)</Title>

            {cycles.map(cycle => {
                const grossValue = cycle.settlementInstructions.reduce((acc, i) => acc + i.amount, 0);
                // Note: Gross value calculation here is imperfect as instructions are NET. 
                // Ideally we'd store the original gross in the cycle record.
                // For visuals, let's just show the instructions.

                return (
                    <Card key={cycle.id} shadow="xs" radius="md" withBorder mb="lg" style={{ overflow: 'visible' }}>
                        <Card.Section withBorder inheritPadding py="xs" bg="gray.0">
                            <Group justify="space-between">
                                <Group>
                                    <ThemeIcon color="grape" variant="light"><IconScale /></ThemeIcon>
                                    <Text fw={700}>Cycle #{cycle.id}</Text>
                                    <Badge variant="dot" color={cycle.status === 'CLOSED' ? 'green' : 'blue'}>{cycle.status}</Badge>
                                </Group>
                                <Text size="xs" c="dimmed">{new Date(cycle.startTime).toLocaleString()}</Text>
                            </Group>
                        </Card.Section>

                        <Grid mt="md">
                            <Grid.Col span={4}>
                                <Text size="sm" fw={700} mb="xs" c="dimmed">GENERATED OBLIGATIONS</Text>
                                <List spacing="xs" size="sm" center>
                                    {cycle.settlementInstructions.map(instr => (
                                        <List.Item
                                            key={instr.id}
                                            icon={
                                                instr.debtorAgent === 'SCSE_POOL' ?
                                                    <ThemeIcon color="teal" size={20} radius="xl"><IconCheck size={12} /></ThemeIcon> :
                                                    <ThemeIcon color="orange" size={20} radius="xl"><IconReceipt size={12} /></ThemeIcon>
                                            }
                                        >
                                            <Group gap="xs">
                                                <Text fw={700}>{instr.debtorAgent === 'SCSE_POOL' ? 'POOL' : instr.debtorAgent}</Text>
                                                <Text size="xs">→</Text>
                                                <Text fw={700}>{instr.creditorAgent === 'SCSE_POOL' ? 'POOL' : instr.creditorAgent}</Text>
                                                <Badge variant="outline" color="gray">${instr.amount.toLocaleString()}</Badge>
                                            </Group>
                                        </List.Item>
                                    ))}
                                </List>
                            </Grid.Col>
                            <Grid.Col span={8}>
                                <Alert icon={<IconCheck />} color="green" title="Efficiency" variant="light" mb="md">
                                    Liquidity Optimization complete. {cycle.settlementInstructions.length} instructions generated to settle the cycle.
                                </Alert>
                                <Button
                                    fullWidth variant="light" color="green"
                                    onClick={() => settleCycle(cycle.id)}
                                    disabled={cycle.settlementInstructions.every(i => i.status === 'SETTLED')}
                                >
                                    {cycle.settlementInstructions.every(i => i.status === 'SETTLED') ? 'Settled on Ledger' : 'Execute Final Settlement'}
                                </Button>
                            </Grid.Col>
                        </Grid>
                    </Card>
                )
            })}
        </div>
    )
}
