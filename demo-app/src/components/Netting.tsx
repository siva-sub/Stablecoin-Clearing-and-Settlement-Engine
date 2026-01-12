import { Paper, Title, Button, Table, Badge, Card, Text, Group } from '@mantine/core';
import { useSCSEStore } from '../core/store';
import { NettingEngine, SettlementManager } from '../core/engine';
import { IconArrowsShuffle, IconCheck } from '@tabler/icons-react';
import { useState } from 'react';

export function Netting() {
    const { cycles, payments } = useSCSEStore();
    const [loading, setLoading] = useState(false);

    const clearedCount = payments.filter(p => p.status === 'CLEARED').length;

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
            <Paper p="lg" radius="md" shadow="xs" withBorder bg="indigo.0">
                <Group justify="space-between">
                    <div>
                        <Title order={3}>Multilateral Netting Engine</Title>
                        <Text c="dimmed">Accumulate payments and settle the difference.</Text>
                    </div>
                    <Button
                        size="lg" color="indigo"
                        leftSection={<IconArrowsShuffle />}
                        onClick={runCycle}
                        loading={loading}
                        disabled={clearedCount === 0}
                    >
                        Run Cycle ({clearedCount} Pending)
                    </Button>
                </Group>
            </Paper>

            <Title order={4}>Cycle History</Title>

            {cycles.map(cycle => (
                <Card key={cycle.id} shadow="xs" radius="md" withBorder mb="md">
                    <Group justify="space-between" mb="md">
                        <Group>
                            <Title order={5}>Cycle #{cycle.id.substr(0, 6)}</Title>
                            <Badge>{cycle.settlementInstructions.length} Instructions</Badge>
                        </Group>
                        <Button
                            size="xs" variant="outline"
                            onClick={() => settleCycle(cycle.id)}
                            disabled={cycle.settlementInstructions.every(i => i.status === 'SETTLED')}
                        >
                            Settle Instructions
                        </Button>
                    </Group>

                    <Table striped>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Type</Table.Th>
                                <Table.Th>Agent</Table.Th>
                                <Table.Th align="right">Amount</Table.Th>
                                <Table.Th>Status</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {cycle.settlementInstructions.map(instr => (
                                <Table.Tr key={instr.id}>
                                    <Table.Td>
                                        {instr.debtorAgent === 'SCSE_POOL' ?
                                            <Badge color="green" variant="light">PAYOUT</Badge> :
                                            <Badge color="orange" variant="light">COLLECT</Badge>
                                        }
                                    </Table.Td>
                                    <Table.Td>
                                        {instr.debtorAgent === 'SCSE_POOL' ? instr.creditorAgent : instr.debtorAgent}
                                    </Table.Td>
                                    <Table.Td align="right">
                                        <Text fw="bold">${instr.amount.toFixed(2)}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        {instr.status === 'SETTLED' ? <IconCheck size={16} color="green" /> : 'PENDING'}
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Card>
            ))}
        </div>
    )
}
