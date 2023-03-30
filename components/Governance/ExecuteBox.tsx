import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import { ethers } from 'ethers';

// import { useGetState } from '../web3/useGetState';
// import { useEffect, useState } from 'react';
// import { useExecuteProposal } from '../web3/ExecuteProposal';

export const ExecuteProposal = ({ lastId, signer, value, description }) => {
    const handleVotingState = (e) => {

        const status = {
            "0": "Pending",
            "1": "Active",
            "2": "Canceled",
            "3": "Defeated",
            "4": "Succeeded",
            "5": "Queued",
            "6": "Expired",
            "7": "Executed"
        };
        return status[e] ?? "Unknown";
    }

    const shortId = lastId ? lastId.slice(0, 11) + "..." : 0;


    return (<>
        <CardContent>
            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                Current/Latest Voting
            </Typography>
            <Typography variant="h5" component="div">
                id
            </Typography>
            <Typography sx={{ mb: 1.5 }} color="text.secondary">
                The Proposal state is:
            </Typography>

        </CardContent>

    </>)
}

// signer, proposalId, support, reason