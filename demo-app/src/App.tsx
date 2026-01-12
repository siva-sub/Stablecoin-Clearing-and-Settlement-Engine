import '@mantine/core/styles.css';
import { AppShell, Burger, Group, NavLink, MantineProvider, Title, Text, ThemeIcon } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconDashboard, IconArrowsShuffle, IconSettings, IconCoin } from '@tabler/icons-react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { Netting } from './components/Netting';
import { useEffect } from 'react';
import { useSCSEStore } from './core/store';

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
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <ThemeIcon size="lg" radius="md" variant="gradient" gradient={{ from: 'indigo', to: 'cyan' }}>
            <IconCoin />
          </ThemeIcon>
          <Title order={3}>SCSE <Text span c="dimmed" size="sm" fw={500}>Clearing & Settlement</Text></Title>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <NavLink
          label="Dashboard"
          leftSection={<IconDashboard size={16} />}
          component={Link} to="/"
          active={location.pathname === '/'}
          variant="filled"
        />
        <NavLink
          label="Netting Engine"
          leftSection={<IconArrowsShuffle size={16} />}
          component={Link} to="/netting"
          active={location.pathname === '/netting'}
          variant="filled"
        />
        <NavLink
          label="Admin"
          leftSection={<IconSettings size={16} />}
          onClick={() => { if (confirm('Reset DB?')) { localStorage.clear(); window.location.reload(); } }}
        />
      </AppShell.Navbar>

      <AppShell.Main bg="gray.0">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/netting" element={<Netting />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
}

export default function App() {
  return (
    <MantineProvider>
      <BrowserRouter basename="/Stablecoin-Clearing-and-Settlement-Engine">
        <AppContent />
      </BrowserRouter>
    </MantineProvider>
  );
}
