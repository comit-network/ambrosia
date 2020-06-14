import React from 'react';
import {
  Heading,
  Text,
  Switch,
  Box,
  Divider,
  FormControl,
  FormLabel,
  Input,
  FormHelperText,
  Select,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel
} from '@chakra-ui/core';

export default function SettingsPage() {
  return (
    <Box width="100%">
      <Heading fontSize="1.8em" mb={8}>
        Settings
      </Heading>

      <Tabs variant="soft-rounded" variantColor="cyan">
        <TabList mb={4}>
          <Tab>General</Tab>
          <Tab>Accounts</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Box bg="white" p={5} shadow="md" borderWidth="1px">
              <FormControl>
                <FormLabel htmlFor="email">Email address</FormLabel>
                <Input
                  type="email"
                  id="email"
                  aria-describedby="email-helper-text"
                />
                <FormHelperText id="email-helper-text">
                  We will never share your email.
                </FormHelperText>
              </FormControl>

              <Divider />

              <Text fontWeight="600">Primary currency</Text>
              <Text>blah blah</Text>

              <Select placeholder="Select option">
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
                <option value="option3">Option 3</option>
              </Select>

              <Divider />

              <Text fontWeight="600">Password lock</Text>
              <Text>blah blah</Text>

              <Switch size="lg" />
            </Box>
          </TabPanel>
          <TabPanel>
            <Box bg="white" p={5} shadow="md" borderWidth="1px">
              <p>Read and display .env contents</p>
              {/* TODO: https://github.com/sindresorhus/electron-store */}
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
