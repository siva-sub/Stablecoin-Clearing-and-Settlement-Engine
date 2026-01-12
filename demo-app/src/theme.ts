import { createTheme, type MantineColorsTuple } from '@mantine/core';

const scseBlue: MantineColorsTuple = [
    '#eef3ff',
    '#dce4f5',
    '#b9c7e2',
    '#94a8d0',
    '#748dc1',
    '#5f7cb8',
    '#5474b4',
    '#44639f',
    '#39588f',
    '#2d4b81'
];

export const theme = createTheme({
    primaryColor: 'cyan',
    defaultRadius: 'md',
    fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
    headings: {
        fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
    },
    components: {
        Card: {
            defaultProps: {
                shadow: 'sm',
                withBorder: true,
            },
        },
        Paper: {
            defaultProps: {
                withBorder: true,
            }
        }
    },
});
