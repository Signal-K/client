from brownie import Token, accounts

def main():
    acct = accounts.load('deployment_account')
    Token.deploy("", "", 18, 1e28, {'from': acct})