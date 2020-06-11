import React from 'react';
import { Heading, Text, Box, Divider } from '@chakra-ui/core';

export default function SettingsPage() {
  return (
    <Box width="100%">
      <Heading fontSize="1.8em" mb={8}>
        Settings
      </Heading>

      <Box bg="white" p={5} shadow="md" borderWidth="1px">
        <h2>This is the Settings page</h2>
        <Text mt={4}>desc</Text>

        <Divider />

        {/* TODO */}
        {/* <Text mt={4}>HTTP_URL_CND_0: {process.env.HTTP_URL_CND_0}</Text> */}
      </Box>
    </Box>
  );
}
