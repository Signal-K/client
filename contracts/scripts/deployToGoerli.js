async function main() {
    const PlanetProposal = await ethers.getContractFactory("PlanetProposal");
    const gasPrice = await PlanetProposal.signer.getGasPrice();
    const estimatedGas = await PlanetProposal.signer.estimateGas(
        PlanetProposal.getDeployTransaction()
    );

    const deploymentPrice = gasPrice.mul(estimatedGas);
    const deployerBalance = await PlanetProposal.signer.getBalance();

    if (Number(deployerBalance) < Number(deploymentPrice)) {
        throw new Error("You don't have enough balance to deploy");
    }
}