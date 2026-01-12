import { Paper, Title, Button, Table, Badge, Card, Text, Group, Alert, Grid, Progress, List, ThemeIcon, LoadingOverlay } from '@mantine/core';
import { useSCSEStore } from '../core/store';
import { NettingEngine, SettlementManager } from '../core/engine';
import { IconArrowsShuffle, IconCheck, IconCalculator, IconScale, IconReceipt, IconCoin } from '@tabler/icons-react';
import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import SettlementABI from '../abi/Settlement.json';
import MockUSDCABI from '../abi/MockUSDC.json';
import { parseUnits } from 'viem';

// Addresses (Sepolia Testnet)
const SETTLEMENT_ADDR = '0x27BeFc27e515DA31378e1DA20343134c1939f55a';
const USDC_ADDR = '0x4D2C70FF3f02D91afB1872FE2595e609965D775a';

export function Netting() {
    const { cycles, payments } = useSCSEStore();
    const [loading, setLoading] = useState(false);

    // Web3 Hooks
    const { address, isConnected } = useAccount();
    const { writeContractAsync } = useWriteContract();
    const publicClient = usePublicClient();

    const clearedPayments = payments.filter(p => p.status === 'CLEARED');
    const clearedVolume = clearedPayments.reduce((a, b) => a + b.amount, 0);

    const runCycle = async () => {
        setLoading(true);
        await NettingEngine.runCycle();
        setLoading(false);
    };

    const settleCycle = async (id: string, instructions: any[]) => {
        setLoading(true);
        // 1. Update Local State (Visual)
        await SettlementManager.processCycle(id);
        setLoading(false);
    };

    const settleOnChain = async (cycle: any) => {
        if (!isConnected) {
            alert("Please connect wallet first");
            return;
        }
        setLoading(true);
        try {
            const instrs = cycle.settlementInstructions;
            // Mock Debtor/Creditor Mapping for Demo
            // In reality, 'BANK_A' -> Address A
            // Here, we just use the connected user for everything to make the transaction pass (Self-transfer)

            await writeContractAsync({
                address: SETTLEMENT_ADDR,
                abi: SettlementABI.abi,
                functionName: 'settleBatch',
                args: [
                    [address], // Debtor (Self)
                    [BigInt(0)],
                    [address], // Creditor (Self)
                    [BigInt(0)]
                ]
            });

            alert("Transaction Submitted to Blockchain!");
            await SettlementManager.processCycle(cycle.id); // Update UI

        } catch (e: any) {
            console.error(e);
            alert("On-Chain Fail: " + e.message);
        }
        setLoading(false);
    };


    return (
        <div className="space-y-6">
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

            <Title order={4} mt="xl" mb="md">Netting Cycles (Newest First)</Title>

            {cycles.map(cycle => (
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
                                {cycle.settlementInstructions.map((instr: any) => (
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
                                Liquidity Optimization complete. {cycle.settlementInstructions.length} instructions generated.
                            </Alert>
                            <Text size="sm" mb="xs" fw={500}>Choose Settlement Method:</Text>
                            <Group grow>
                                <Tooltip label="Offline Mode: Instantly updates balances in the local database. No Wallet/Gas required." multiline w={220}>
                                    <Button
                                        variant="light" color="green"
                                        onClick={() => settleCycle(cycle.id, cycle.settlementInstructions)}
                                        disabled={cycle.settlementInstructions.every((i: any) => i.status === 'SETTLED')}
                                    >
                                        Simulate (Offline)
                                    </Button>
                                </Tooltip>

                                <Tooltip label="Web3 Mode: Sends a real transaction to Sepolia Testnet. Updates the Smart Contract state." multiline w={220}>
                                    <Button
                                        variant="filled"
                                        gradient={{ from: 'orange', to: 'red' }}
                                        leftSection={<IconCoin size={16} />}
                                        onClick={() => settleOnChain(cycle)}
                                        disabled={!isConnected || cycle.settlementInstructions.every((i: any) => i.status === 'SETTLED')}
                                    >
                                        Settle on Blockchain
                                    </Button>
                                </Tooltip>
                            </Group>
                        </Grid.Col>
                    </Grid>
                </Card>
            ))}
        </div>
    )
}
