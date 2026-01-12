import { Paper, Title, SimpleGrid, Group, Text, Button, Table, Badge, Card } from '@mantine/core';
import { useSCSEStore } from '../core/store';
import { ClearingEngine, SettlementManager } from '../core/engine';
import { IconPlus } from '@tabler/icons-react';
import { useState } from 'react';

export function Dashboard() {
    const { participants, payments } = useSCSEStore();
    const [loading, setLoading] = useState(false);

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

    const settleRTGS = async () => {
        setLoading(true);
        await SettlementManager.processRTGS();
        setLoading(false);
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <Title order={2}>Overview</Title>
                <Group>
                    <Button leftSection={<IconPlus size={16} />} onClick={sendRandomPayment} loading={loading}>
                        Simulate Payment
                    </Button>
                    <Button variant="light" color="green" onClick={settleRTGS} loading={loading}>
                        Settle All (RTGS)
                    </Button>
                </Group>
            </div>

            {/* Balances */}
            <SimpleGrid cols={{ base: 1, sm: 3 }}>
                {participants.map(p => (
                    <Paper key={p.id} p="md" shadow="xs" radius="md" withBorder>
                        <Group justify="space-between">
                            <div>
                                <Text size="xs" c="dimmed" fw={700} tt="uppercase">Participant</Text>
                                <Text fw={700} size="lg">{p.name}</Text>
                                <Text size="xs" c="dimmed">{p.id}</Text>
                            </div>
                            <div>
                                <Text size="xl" fw={900} c="indigo">
                                    ${p.balance.toLocaleString()}
                                </Text>
                                <Text size="xs" ta="right" c="dimmed">USDC</Text>
                            </div>
                        </Group>
                    </Paper>
                ))}
            </SimpleGrid>

            {/* Transactions Table */}
            <Card shadow="xs" radius="md" withBorder>
                <Title order={4} mb="md">Recent Transactions</Title>
                <Table>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>ID</Table.Th>
                            <Table.Th>From</Table.Th>
                            <Table.Th>To</Table.Th>
                            <Table.Th align="right">Amount</Table.Th>
                            <Table.Th>Status</Table.Th>
                            <Table.Th>Ref</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {payments.slice(0, 10).map(p => (
                            <Table.Tr key={p.instructionId}>
                                <Table.Td><Text fz="xs" ff="monospace">{p.instructionId}</Text></Table.Td>
                                <Table.Td>{p.debtorAgent}</Table.Td>
                                <Table.Td>{p.creditorAgent}</Table.Td>
                                <Table.Td align="right"><Text fw="bold">${p.amount}</Text></Table.Td>
                                <Table.Td>
                                    <Badge
                                        color={
                                            p.status === 'SETTLED' ? 'green' :
                                                p.status === 'CLEARED' ? 'blue' :
                                                    p.status === 'NETTED' ? 'grape' :
                                                        p.status === 'REJECTED' ? 'red' : 'gray'
                                        }
                                    >
                                        {p.status}
                                    </Badge>
                                </Table.Td>
                                <Table.Td><Text fz="xs" ff="monospace" c="dimmed">{p.settlementRef?.substr(0, 8)}...</Text></Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </Card>
        </div>
    )
}
