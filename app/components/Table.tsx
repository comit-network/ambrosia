/* eslint-disable react/prop-types */
import { Box, PseudoBox, BoxProps, PseudoBoxProps } from "@chakra-ui/core";
import React, { MouseEvent } from "react";

const BOX_SHADOW = "0 1px 5px 0 rgba(0, 0, 0, 0.1)";

interface ContainerProps extends BoxProps {
    variant: "default" | "list";
}

const PAD = 2;

export const Container: React.FC<ContainerProps> = ({
                                                        children,
                                                        variant = "default",
                                                        ...rest
                                                    }) => {
    return (
        <Box
            display="block"
            w="100%"
            borderRadius={4}
            border={variant === "list" ? "none" : "1px"}
            boxShadow={variant === "list" ? "none" : BOX_SHADOW}
            borderColor="gray.200"
            overflow="auto"
            {...rest}
        >
            {children}
        </Box>
    );
};

export const Table: React.FC<BoxProps> = ({ children, ...rest }) => {
    return (
        <Box
            as="table"
            w="100%"
            table-layout="auto"
            border-collapse="collapse"
            {...rest}
        >
            {children}
        </Box>
    );
};

export const Thead: React.FC<BoxProps> = ({ children, ...rest }) => {
    return (
        <Box as="thead" p={PAD} textAlign="left" {...rest}>
            {children}
        </Box>
    );
};

export const Tbody: React.FC<BoxProps> = ({ children, ...rest }) => {
    return (

        <Box as="tbody" p={PAD} {...rest}>
            {children}
        </Box>
    );
};

export const Tfoot: React.FC<BoxProps> = ({ children, ...rest }) => {
    return (
        <Box as="tfoot" p={PAD} {...rest}>
            {children}
        </Box>
    );
};

export const Tr: React.FC<BoxProps> = ({ children, ...rest }) => {
    return (
        <PseudoBox as="tr" my={1} {...rest}>
            {children}
        </PseudoBox>
    );
};

interface ThProps extends PseudoBoxProps {
    onClick?: (event: MouseEvent) => void;
}

export const Th: React.FC<ThProps> = ({ children, onClick, ...rest }) => {
    return (
        <PseudoBox
            as="th"
            p={PAD}
            borderBottom="1px"
            borderBottomColor="gray.200"
            _hover={{ cursor: onClick ? "pointer" : "" }}
            onClick={onClick}
            {...rest}
        >
            {children}
        </PseudoBox>
    );
};

export const Td: React.FC<ThProps> = ({ children, onClick, ...rest }) => (
    <PseudoBox
        as="td"
        p={PAD}
        borderBottom="1px"
        borderBottomColor="gray.200"
        _hover={{ cursor: onClick ? "pointer" : "" }}
        onClick={onClick}
        {...rest}
    >
        {children}
    </PseudoBox>
);

export default {
    Container,
    Table,
    Thead,
    Tbody,
    Tfoot,
    Tr,
    Th,
    Td
};
