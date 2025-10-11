/**
 * Copyright (C) SettleMint NV - All Rights Reserved
 *
 * Use of this file is strictly prohibited without an active license agreement.
 * Distribution of this file, via any medium, is strictly prohibited.
 *
 * For license inquiries, contact hello@settlemint.com
 *
 * SPDX-License-Identifier: UNLICENSED
 */

pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol';
import '@openzeppelin/contracts/security/Pausable.sol';
import '@openzeppelin/contracts/access/AccessControl.sol';
import '@openzeppelin/contracts/metatx/ERC2771Context.sol';
import '@openzeppelin/contracts/utils/introspection/ERC165.sol';

/**
 * @title ERC20Meta
 * @notice This contract is a generic token adhering to the ERC20 standard,
 *  using the OpenZeppelin template libary for battletested functionality.
 *
 *  It incorporates the standard ERC20 functions, enhanced with Minting
 *  and Burning, Pausable in case of emergencies and AccessControl for locking
 *  down the administrative functions. It also implements ERC2771 to handle meta transactions
 *  and have a relayer pay for the gas fees.
 *
 *  For demonstrative purposes, 1 million GTM tokens are pre-mined to the address
 *  deploying this contract.
 */
contract ERC20Meta is
  ERC20,
  ERC20Burnable,
  ERC165,
  ERC2771Context,
  Pausable,
  AccessControl
{
  bytes32 public constant MINTER_ROLE = keccak256('MINTER_ROLE');

  constructor(
    string memory name_,
    string memory symbol_,
    address trustedForwarder_
  ) ERC20(name_, symbol_) ERC2771Context(trustedForwarder_) {
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
  }

  /**
   * @dev Triggers stopped state.
   *
   * Requirements:
   *
   * - The contract must not be paused.
   * - The sender of the transaction must have the DEFAULT_ADMIN_ROLE
   */
  function pause() public onlyRole(DEFAULT_ADMIN_ROLE) {
    _pause();
  }

  /**
   * @dev Returns to normal state.
   *
   * Requirements:
   *
   * - The contract must be paused.
   * - The sender of the transaction must have the DEFAULT_ADMIN_ROLE
   */
  function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) {
    _unpause();
  }

  function setupRole(bytes32 role, address account)
    public
    onlyRole(DEFAULT_ADMIN_ROLE)
  {
    _setupRole(role, account);
  }

  /** @dev Creates `amount` tokens and assigns them to `account`, increasing the total supply.
   *
   * Emits a Transfer event with `from` set to the zero address.
   *
   * Requirements:
   *
   * - `account` cannot be the zero address.
   * - `msg.sender` needs the DEFAULT_ADMIN_ROLE.
   *
   * @param to           The address to mint the new tokens into
   * @param amount       The amount of tokens to mint, denominated by the decimals() function
   */
  function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
    _mint(to, amount);
  }

  /**
   * @dev Destroys `amount` tokens from `account`, reducing the total supply.
   *
   * Emits a Transfer event with `to` set to the zero address.
   *
   * Requirements:
   *
   * - `account` cannot be the zero address.
   * - `account` must have at least `amount` tokens.
   *
   * @param amount       The amount of tokens to burn from the sender of the transaction, denominated by the decimals() function
   */
  function burn(uint256 amount) public virtual override {
    _burn(_msgSender(), amount);
  }

  function _msgSender()
    internal
    view
    override(Context, ERC2771Context)
    returns (address sender)
  {
    sender = ERC2771Context._msgSender();
  }

  function _msgData()
    internal
    view
    override(Context, ERC2771Context)
    returns (bytes calldata)
  {
    return ERC2771Context._msgData();
  }

  /**
   * @dev Hook that is called before any transfer of tokens. This includes minting and burning.
   *
   * Calling conditions:
   *
   * - when `from` and `to` are both non-zero, `amount` of `from`'s tokens will be transferred to `to`.
   * - when `from` is zero, `amount` tokens will be minted for `to`.
   * - when `to` is zero, `amount` of `from`'s tokens will be burned.
   * - `from` and `to` are never both zero.
   */
  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 amount
  ) internal override whenNotPaused {
    super._beforeTokenTransfer(from, to, amount);
  }

  function supportsInterface(bytes4 interfaceId)
    public
    view
    virtual
    override(ERC165, AccessControl)
    returns (bool)
  {
    return
      interfaceId == type(IERC20).interfaceId ||
      interfaceId == type(ERC20Burnable).interfaceId ||
      interfaceId == type(Pausable).interfaceId ||
      interfaceId == type(ERC2771Context).interfaceId ||
      super.supportsInterface(interfaceId); // ERC165, AccessControl
  }
}
