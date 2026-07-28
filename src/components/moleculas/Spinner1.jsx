import styled, { keyframes } from "styled-components";

export function Spinner1() {
    return (
        <Container>
            <Ring />
        </Container>
    );
}

const spin = keyframes`to { transform: rotate(360deg); }`;

const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: #07090f;
`;

const Ring = styled.div`
    width: 52px;
    height: 52px;
    border-radius: 50%;
    border: 3px solid rgba(196, 119, 58, 0.15);
    border-top-color: #C4773A;
    animation: ${spin} 0.85s linear infinite;
`;
