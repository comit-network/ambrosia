import { Box, Button, Heading, List, ListItem, Stack, Text } from '@chakra-ui/core';
import React from 'react';
import { useHistory } from 'react-router-dom';
import routes from '../constants/routes.json';

export default function WelcomePage() {
  const history = useHistory();

  return <Box ml={"auto"} mr={"auto"} maxWidth={"80ch"} boxSizing={"content-box"}>

    <Stack spacing={"5rem"} mt={"5rem"}>
      <Stack spacing={"1rem"}>
        <Heading fontSize={"6xl"} as={"h1"}>
          Welcome to Tantalus!
        </Heading>

        <Text fontSize={"2xl"}>
          Tantalus is a peer-to-peer, non-custodial crypto currency trading platform. As such, it requires some setup before you can use it. Specifically you will need:
        </Text>
        <List styleType="disc" fontSize={"2xl"}>
          <ListItem>A Ledger Nano S hardware wallet</ListItem>
          <ListItem>A Bitcore-Core node</ListItem>
          <ListItem>Access to an Ethereum node (Infura also works!)</ListItem>
        </List>
      </Stack>

      <Box display={"flex"} justifyContent={"center"}>
        { /* TODO: Make this a link that looks like a button ... */ }
        <Button size={"lg"} variantColor="green" onClick={() => history.push(routes.SETUP)}>I am ready, let's start!</Button>
      </Box>
    </Stack>

  </Box>
}
