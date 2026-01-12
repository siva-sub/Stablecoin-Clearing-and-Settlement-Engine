import { Paper, Title, Text, Group, Badge, Timeline, ThemeIcon, Card, SimpleGrid, Alert } from '@mantine/core';
import { IconCheck, IconBuildingBank, IconServer, IconInfoCircle, IconWallet } from '@tabler/icons-react';
import { useSCSEStore } from '../core/store';
import { useAccount } from 'wagmi';

export function Settlement() {
    const { payments } = useSCSEStore();
    const { isConnected, address } = useAccount();

    // Filter for payments that have reached finality
    const settledPayments = payments.filter(p => p.status === 'SETTLED');
    const totalSettled = settledPayments.reduce((acc, p) => acc + p.amount, 0);

    return (
        <div className="space-y-6">
            <Paper p="xl" radius="md" bg="teal.0" withBorder>
                <Group justify="space-between">
                    <div>
                        <Title order={3} c="teal.9">Settlement & Finality</Title>
                        <Text c="teal.8">
                            Real-time Gross Settlement (RTGS) and Net Settlement finality provided by Ethereum Smart Contracts.
                        </Text>
                    </div>
                    <ThemeIcon size={50} radius="md" color="teal" variant="light">
                        <IconServer size={30} />
                    </ThemeIcon>
                </Group>
            </Paper>

            <SimpleGrid cols={{ base: 1, md: 2 }}>
                <Card title="Smart Contract Status" withBorder radius="md">
                    <Group mb="md">
                        <IconWallet size={24} color={isConnected ? 'green' : 'gray'} />
                        <Title order={4}>Blockchain Connection</Title>
                    </Group>

                    {isConnected ? (
                        <Alert variant="light" color="green" title="Connected" icon={<IconCheck />}>
                            Bridge Active. Wallet: <Text span ff="monospace" size="xs">{address}</Text><br />
                            You can now cryptographically sign settlement batches.
                        </Alert>
                    ) : (
                        <Alert variant="light" color="orange" title="Disconnected" icon={<IconInfoCircle />}>
                            <b>"Connect Wallet"</b> is required to interact with the Sepolia Blockchain.
                            <br />
                            Without it, the system runs in "Simulation Mode" (Off-chain Ledger only).
                        </Alert>
                    )}
                </Card>

                <Card title="Settlement Statistics" withBorder radius="md">
                    <Group mb="md">
                        <IconBuildingBank size={24} color="blue" />
                        <Title order={4}>Finality Metrics</Title>
                    </Group>
                    <Group grow>
                        <div>
                            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Total Value Settled</Text>
                            <Text size="xl" fw={700}>${totalSettled.toLocaleString()}</Text>
                        </div>
                        <div>
                            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Transactions</Text>
                            <Text size="xl" fw={700}>{settledPayments.length}</Text>
                        </div>
                    </Group>
                </Card>

                <Card title="Contract Verification" withBorder radius="md" style={{ gridColumn: '1 / -1' }}>
                    <Group mb="md">
                        <ThemeIcon color="grape" variant="light"><IconCheck /></ThemeIcon>
                        <Title order={4}>On-Chain Verification (Sepolia)</Title>
                    </Group>
                    <SimpleGrid cols={{ base: 1, sm: 2 }}>
                        <div>
                            <Text size="xs" fw={700} c="dimmed">SETTLEMENT CONTRACT</Text>
                            <Text size="xs" ff="monospace" c="blue" component="a" href="https://sepolia.etherscan.io/address/0x27BeFc27e515DA31378e1DA20343134c1939f55a#code" target="_blank">
                                0x27Be...55a
                            </Text>
                            <Text size="xs" c="dimmed">Verified Source Code</Text>
                        </div>
                        <div>
                            <Text size="xs" fw={700} c="dimmed">MOCK USDC</Text>
                            <Text size="xs" ff="monospace" c="blue" component="a" href="https://sepolia.etherscan.io/address/0x4D2C70FF3f02D91afB1872FE2595e609965D775a#code" target="_blank">
                                0x4D2C...75a
                            </Text>
                            <Text size="xs" c="dimmed">ERC-20 Token</Text>
                        </div>
                        <div>
                            <Text size="xs" fw={700} c="dimmed">DEMO WALLET ACTIVITY</Text>
                            <Text size="xs" ff="monospace" c="blue" component="a" href="https://sepolia.etherscan.io/address/0x0cb9cf6c85e96a580a2bf778d141578d4a76e322" target="_blank">
                                View Live Transactions
                            </Text>
                        </div>
                    </SimpleGrid>
                </Card>
            </SimpleGrid>

            <Card withBorder radius="md">
                <Title order={4} mb="xl">Settlement Stream (Finalized on Ledger)</Title>
                {settledPayments.length === 0 ? (
                    <Text c="dimmed" ta="center" py="xl">No payments have reached final settlement/finality yet.</Text>
                ) : (
                    <Timeline active={settledPayments.length} bulletSize={24} lineWidth={2}>
                        {settledPayments.slice(0, 10).map((p) => (
                            <Timeline.Item
                                key={p.instructionId}
                                bullet={<IconCheck size={12} />}
                                color="teal"
                                title={<Text size="sm">Instruction <Text span ff="monospace">{p.instructionId}</Text></Text>}
                            >
                                <Text c="dimmed" size="xs">
                                    Settled obligation between <b>{p.debtorAgent}</b> and <b>{p.creditorAgent}</b>.
                                </Text>
                                <Badge size="xs" color="teal" variant="light" mt={4}>ON-CHAIN</Badge>
                            </Timeline.Item>
                        ))}
                    </Timeline>
                )}
            </Card>
        </div>
    );
}
