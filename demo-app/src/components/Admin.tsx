import { Paper, Title, Button, Text, Container, Group, Card, ThemeIcon } from '@mantine/core';
import { IconTrash, IconBolt, IconArrowsJoin2 } from '@tabler/icons-react';
import { useSCSEStore } from '../core/store';
import { ClearingEngine } from '../core/engine';
import { useState } from 'react';

export function Admin() {
    const seed = useSCSEStore(s => s.seedData);
    const wipe = useSCSEStore(s => s.wipeData);
    const [loading, setLoading] = useState(false);

    const handleReset = () => {
        if (confirm('This will wipe all data. Continue?')) {
            wipe();
            seed();
            window.location.reload();
        }
    };

    const injectTraffic = async () => {
        setLoading(true);
        const store = useSCSEStore.getState();
        const participants = store.participants;

        for (let i = 0; i < 10; i++) {
            const from = participants[Math.floor(Math.random() * participants.length)];
            let to = participants[Math.floor(Math.random() * participants.length)];
            while (to.id === from.id) to = participants[Math.floor(Math.random() * participants.length)];

            await ClearingEngine.submitPayment({
                instructionId: `LOAD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                debtorAgent: from.id,
                creditorAgent: to.id,
                amount: Math.floor(Math.random() * 500) + 100,
                currency: 'USDC'
            });
        }
        setLoading(false);
    };

    const injectCircle = async () => {
        setLoading(true);
        // A -> B 100
        await ClearingEngine.submitPayment({
            instructionId: `CIRC-1-${Math.random().toString(36).substr(2, 4)}`,
            debtorAgent: 'BANK_A', creditorAgent: 'BANK_B', amount: 100, currency: 'USDC'
        });
        // B -> C 100
        await ClearingEngine.submitPayment({
            instructionId: `CIRC-2-${Math.random().toString(36).substr(2, 4)}`,
            debtorAgent: 'BANK_B', creditorAgent: 'BANK_C', amount: 100, currency: 'USDC'
        });
        // C -> A 100
        await ClearingEngine.submitPayment({
            instructionId: `CIRC-3-${Math.random().toString(36).substr(2, 4)}`,
            debtorAgent: 'BANK_C', creditorAgent: 'BANK_A', amount: 100, currency: 'USDC'
        });
        setLoading(false);
        alert('Circular Payments Injected! Go to Netting Engine to see 100% efficiency.');
    };

    return (
        <Container size="md">
            <Title mb="xl">Simulation Control</Title>

            <div className="grid gap-6">
                <Card padding="lg" radius="md">
                    <Group mb="md">
                        <ThemeIcon size="lg" color="blue" variant="light"><IconBolt /></ThemeIcon>
                        <Text fw={700}>Traffic Injection</Text>
                    </Group>
                    <Text size="sm" c="dimmed" mb="md">
                        Simulate high-volume network activity by injecting random payments between participants.
                    </Text>
                    <Button variant="light" onClick={injectTraffic} loading={loading}>Inject 10 Transactions</Button>
                </Card>

                <Card padding="lg" radius="md">
                    <Group mb="md">
                        <ThemeIcon size="lg" color="indigo" variant="light"><IconArrowsJoin2 /></ThemeIcon>
                        <Text fw={700}>Scenario: Perfect Netting Circle</Text>
                    </Group>
                    <Text size="sm" c="dimmed" mb="md">
                        Injects a 3-way circular payment (A→B→C→A) of equal value.
                        Running a netting cycle on this should result in <b>Zero Settlement Obligations</b> (100% Efficiency).
                    </Text>
                    <Button color="indigo" variant="light" onClick={injectCircle} loading={loading}>Inject Circle Scenario</Button>
                </Card>

                <Card padding="lg" radius="md" withBorder style={{ borderColor: 'var(--mantine-color-red-3)' }}>
                    <Group mb="md">
                        <ThemeIcon size="lg" color="red" variant="light"><IconTrash /></ThemeIcon>
                        <Text fw={700} c="red">Danger Zone</Text>
                    </Group>
                    <Text size="sm" c="dimmed" mb="md">
                        Wipe all local data and reset balances to initial state.
                    </Text>
                    <Button color="red" variant="subtle" onClick={handleReset}>Factory Reset Database</Button>
                </Card>
            </div>
        </Container>
    );
}
