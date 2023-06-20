
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';
import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useState, useEffect } from 'react';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';

import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { VoteProposal } from './VoteBox';
import { ExecuteProposal } from './ExecuteBox';

import { useGetProposals } from './Connections/GetProposalCount';
import { useGetTotalVoters } from './Connections/GetVotersCount';
import { useGetBalance } from './Connections/GetTokenBalance';
import { useGetValue } from './Connections/GetCurrentValue';
import { useRequestFunds } from './Connections/GetFunds';
import { useCreateProposal } from './Connections/NewProposal';

export const Navbar = ({ signer }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [shortId, setShortId] = useState();
    const [propDesc, setPropDesc] = useState();
    const [propValue, setPropValue] = useState();
    const { proposalCount, getProposalCount } = useGetProposals();
    const { voters, getVoters } = useGetTotalVoters();
    const { userBalance, getBalance } = useGetBalance();
    const { boxValue, getValue } = useGetValue();
    const { requestFunds } = useRequestFunds();
    const { createProposal, proposal, newValue, proposalDescription } = useCreateProposal();

    useEffect(() => { getProposalCount() }, [])
    useEffect(() => { getVoters() }, [])
    useEffect(() => {
        if (signer) {
            getBalance(signer._address)
        }
    }, [signer])
    useEffect(() => { getValue() }, [])
    useEffect(() => { setShortId(proposal ? proposal.slice(0, 11) + "..." : "0") }, [proposal])

    return (
        <>
            <GlobalStyles styles={{ ul: { margin: 0, padding: 0, listStyle: 'none' } }} />
            {/*<CssBaseline />*/}
            <div className='presentation-container'>
                <div className='presentation'>
                    <Typography variant="h5" align="left" color="white" component="p" width="70%">
                        Shape the future of our decentralized community. Join our DAO and have a say in our collective decision-making process. Participate in discussions, propose new ideas, and cast your vote on important issues.
                    </Typography>
                    <div className='pres-buttons'>
                        <Button variant='contained' className='pres-btn' onClick={() => { window.open('https://moralis.io/joindiscord/', '_blank'); }}>Join Discord!</Button>
                        <Button variant='contained' className='pres-btn' onClick={() => { window.open('https://docs.moralis.io/', '_blank'); }}>Read the Docs</Button>

                    </div>
                    <div className='background-img'></div>
                </div>
                <div className='cards'>
                    <div className='card'>
                        <p>PROPOSALS</p>
                        <Typography variant="h6" align="left" color="text.primary" component="p" width="70%">
                            {proposalCount} Total proposals
                        </Typography >
                        <p className='card-text'>PARTICIPATE AND PROPOSE NOW</p>

                    </div>
                    <div className='card'>
                        <p>ELIGIBLE VOTERS</p>
                        <Typography variant="h6" align="left" color="text.primary" component="p" width="70%">
                            {voters} Total Voters
                        </Typography >
                        <p className='card-text'>JOIN THE DAO NOW AND BECOME ONE</p>

                    </div>
                    <div className='card'>
                        <p>YOUR VOTING POWER</p>
                        <Typography variant="h6" align="left" color="text.primary" component="p" width="70%">
                            {userBalance}
                        </Typography >
                        <p className='card-text'>BASED ON YOUR TOKEN BALANCE</p>
                    </div>
                </div>
            </div>
            <div className='dao'>
                <Container disableGutters maxWidth="sm" component="main" sx={{ pt: 8, pb: 6 }}>
                    <Typography variant="h6" align="center" color="white" component="p"
                    >

                        <div>
                            <Stack spacing={2} direction="row" justifyContent='center'>

                                <Button variant="contained" onClick={() => {
                                    setActiveTab(0);
                                    getValue()
                                }}>Current Value</Button>
                                <Button variant="contained" onClick={() => {
                                    setActiveTab(1);

                                }}>Get Funds</Button>
                                <Button variant="contained" onClick={() => {
                                    setActiveTab(2)
                                }}>Propose</Button>
                                <Button variant="contained" onClick={() => {
                                    setActiveTab(3)
                                }}>Vote</Button>
                                <Button variant="contained" onClick={() => {

                                    setActiveTab(4)
                                }}>Execute</Button>

                            </Stack>
                            <div>
                                {activeTab === 0 && (
                                    <div>
                                        <h2>The state of the DAO</h2>
                                        <p>The current Value of the Box is: </p>
                                        <h2>{boxValue}</h2>

                                    </div>
                                )}
                                {activeTab === 1 && (
                                    <div>
                                        <h2>Get Funds to Participate on the DAO</h2>
                                        <p>Only the owners of the ERC20 Token can Vote</p>

                                        <Button variant='contained' onClick={() => {
                                            requestFunds(signer)
                                        }}>Get Funds</Button>
                                    </div>
                                )}
                                {activeTab === 2 && (
                                    <div>
                                        <h2>Propose a new Execution</h2>
                                        <p>The Dao members will vote to decide what happens next</p>
                                        <p> Last proposal: {shortId} </p>
                                        <div className='prop-card'>
                                            <Box
                                                component="form"
                                                sx={{
                                                    '& > :not(style)': { m: 1, width: '25ch' },
                                                }}
                                                noValidate
                                                autoComplete="off"
                                            >
                                                <TextField id="outlined-basic" label="Proposal Description" variant="outlined" onChange={() => { }} defaultValue={''} name='proposalDescription' />
                                                <TextField id="outlined-basic" label="Proposal Value" variant="outlined" onChange={() => { }} defaultValue={''} name='proposalAmount' />
                                            </Box>
                                        </div>
                                        <Button variant='contained' onClick={() => {
                                        }}>Create Proposal</Button>
                                    </div>
                                )}
                                {activeTab === 3 && (
                                    <div>
                                        <h2>Choose your preference</h2>
                                        <p>Vote and engage with the DAO</p>
                                        <Box sx={{ minWidth: 275 }}>
                                            <Card variant="outlined"><VoteProposal /></Card>
                                        </Box>
                                    </div>
                                )}
                                {activeTab === 4 && (
                                    <div>
                                        <h2>Queue & Execute</h2>
                                        <p>Vote Period has Finished, time to execute!</p>
                                        <Box sx={{ minWidth: 275 }}>
                                            <Card variant="outlined"><ExecuteProposal /></Card>
                                        </Box>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Typography>
                </Container>
            </div>
        </>
    )
}