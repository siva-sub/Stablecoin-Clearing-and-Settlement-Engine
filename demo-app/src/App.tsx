import '@mantine/core/styles.css';
import { AppShell, Burger, Group, NavLink, MantineProvider, Title, Text, ThemeIcon, Badge, Avatar, Box, Divider } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconDashboard, IconArrowsShuffle, IconSettings, IconCoin, IconActivity, IconTopologyStar3, IconServer } from '@tabler/icons-react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { Netting } from './components/Netting';
import { Admin } from './components/Admin';
import { useEffect } from 'react';
import { useSCSEStore } from './core/store';
import { theme } from './theme';

function AppContent() {
  const [opened, { toggle }] = useDisclosure();
  const location = useLocation();
  const seed = useSCSEStore(s => s.seedData);
  const participants = useSCSEStore(s => s.participants);

  useEffect(() => {
    if (participants.length === 0) seed();
  }, []);

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{ width: 280, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="xl"
      bg="gray.0"
    >
      <AppShell.Header bg="#1A1B1E">
        <Group h="100%" px="lg" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" color="white" />
            <ThemeIcon size="xl" radius="md" variant="gradient" gradient={{ from: 'cyan', to: 'indigo' }}>
              <IconTopologyStar3 size={28} />
            </ThemeIcon>
            <div>
              <Title order={3} c="white" style={{ lineHeight: 1 }}>SCSE</Title>
              <Text size="xs" c="dimmed" fw={500}>Clearing & Settlement Engine</Text>
            </div>
          </Group>
          <Badge leftSection={<IconActivity size={12} />} color="green" variant="light" size="lg">
            SYSTEM ONLINE
          </Badge>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Text c="dimmed" size="xs" fw={700} tt="uppercase" mb="xs" mt="md" pl="xs">Monitor</Text>
        <NavLink
          label="Live Dashboard"
          leftSection={<IconDashboard size={20} />}
          component={Link} to="/"
          active={location.pathname === '/'}
          variant="light"
          color="cyan"
          fw={500}
        />

        <Text c="dimmed" size="xs" fw={700} tt="uppercase" mb="xs" mt="xl" pl="xs">Engine</Text>
        <NavLink
          label="Netting Cycles"
          leftSection={<IconArrowsShuffle size={20} />}
          component={Link} to="/netting"
          active={location.pathname === '/netting'}
          variant="light"
          color="indigo"
          fw={500}
        />
        <NavLink
          label="Settlement"
          leftSection={<IconServer size={20} />}
          component={Link} to="/settlement"
          active={location.pathname === '/settlement'}
          variant="light"
          color="teal"
          fw={500}
          description="RTGS & Simulation"
        />

        <Divider my="lg" />

        <NavLink
          label="Simulation Control"
          leftSection={<IconSettings size={20} />}
          component={Link} to="/admin"
          active={location.pathname === '/admin'}
          variant="filled"
          color="gray"
        />
      </AppShell.Navbar>

      <AppShell.Main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/netting" element={<Netting />} />
          <Route path="/settlement" element={<Box p="xl"><Title>Coming Soon in Phase 5</Title></Box>} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
}

export default function App() {
  return (
    <MantineProvider theme={theme}>
      <BrowserRouter basename="/Stablecoin-Clearing-and-Settlement-Engine">
        <AppContent />
      </BrowserRouter>
    </MantineProvider>
  );
}
