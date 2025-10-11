//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import './ERC20Meta.sol';
import 'hardhat/console.sol';

contract ServiceCatalog is
  Initializable,
  AccessControlUpgradeable,
  ERC2771ContextUpgradeable,
  PausableUpgradeable
{
  struct Service {
    uint256 serviceId;
    string name;
    address provider;
    bytes32 buyerRole;
    uint256 price;
    uint256 supply;
    bool enabled;
    bool buyerCanCancel;
    bool providerCanCancel;
    bool buyerCanValidate;
    bool providerCanValidate;
  }

  struct Deal {
    uint256 dealId;
    uint256 serviceId;
    address buyer;
    uint256 price;
    bool cancelled;
    bool validated;
  }

  bytes32 public constant ALUMNI_ROLE = keccak256('ALUMNI_ROLE');
  bytes32 public constant STUDENT_ROLE = keccak256('STUDENT_ROLE');
  bytes32 public constant SERVICE_PROVIDER_ROLE =
    keccak256('SERVICE_PROVIDER_ROLE');
  bytes32 public constant SERVICE_CREATOR_ROLE =
    keccak256('SERVICE_CREATOR_ROLE');
  bytes32 public constant RELAYER_ROLE = keccak256('RELAYER_ROLE');

  ERC20Meta private token;

  mapping(uint256 => Service) public services;
  mapping(uint256 => Deal) public deals;
  mapping(address => bool) public welcomeBonusReceived;

  using Counters for Counters.Counter;
  Counters.Counter public dealIds;
  Counters.Counter public serviceIds;

  event WelcomeBonusReceived(address indexed user, uint256 amount);

  event ServiceCreated(
    uint256 indexed serviceId,
    string name,
    address indexed provider,
    uint256 price,
    uint256 supply,
    bool enabled,
    bool buyerCanCancel,
    bool providerCanCancel,
    bool buyerCanValidate,
    bool providerCanValidate
  );

  event ServiceUpdated(
    uint256 indexed serviceId,
    uint256 price,
    uint256 supply
  );
  event ServiceProviderUpdated(
    uint256 indexed serviceId,
    address indexed provider
  );
  event DealUpdated(uint256 indexed dealId);

  event DealCreated(
    uint256 indexed dealId,
    uint256 serviceId,
    address indexed buyer,
    address indexed provider,
    uint256 price,
    bool cancelled,
    bool validated
  );

  event DealCancelled(
    uint256 indexed dealId,
    uint256 serviceId,
    address indexed buyer,
    address indexed provider,
    bool cancelled,
    bool validated
  );

  event DealValidated(
    uint256 indexed dealId,
    uint256 serviceId,
    address indexed buyer,
    address indexed provider,
    bool cancelled,
    bool validated
  );

  modifier hasAdminRole() {
    require(
      hasRole(DEFAULT_ADMIN_ROLE, _msgSender()),
      'ServiceCatalog: Caller is not an admin'
    );
    _;
  }

  modifier canBuyService() {
    bool isStudent = hasRole(STUDENT_ROLE, _msgSender());
    bool isAlumni = hasRole(ALUMNI_ROLE, _msgSender());
    require(
      isStudent == true || isAlumni == true,
      'ServiceCatalog: Caller is not a student or alumni'
    );
    _;
  }

  modifier canCancelOrValidateDeal(uint256 dealId) {
    Deal memory deal = deals[dealId];
    require(deal.dealId != 0, 'ServiceCatalog: Invalid dealId');
    require(deal.validated == false, 'ServiceCatalog: Deal is validated');
    require(deal.cancelled == false, 'ServiceCatalog: Deal is cancelled');
    _;
  }

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor(address trustedForwarder_)
    ERC2771ContextUpgradeable(trustedForwarder_)
  {}

  function initialize(address admin, address token_) public initializer {
    token = ERC20Meta(token_);
    _grantRole(DEFAULT_ADMIN_ROLE, admin);
    _setRoleAdmin(ALUMNI_ROLE, RELAYER_ROLE);
    _setRoleAdmin(STUDENT_ROLE, RELAYER_ROLE);
    _setRoleAdmin(SERVICE_PROVIDER_ROLE, RELAYER_ROLE);
  }

  function pauseContract() public hasAdminRole {
    _pause();
  }

  function unPauseContract() public hasAdminRole {
    _unpause();
  }

  function getTokenAddress() public view returns (address) {
    return address(token);
  }

  function getService(uint256 serviceId) public view returns (Service memory) {
    return services[serviceId];
  }

  function getDeal(uint256 dealId) public view returns (Deal memory) {
    return deals[dealId];
  }

  function redeemWelcomeBonus(address user, uint256 amount)
    public
    onlyRole(DEFAULT_ADMIN_ROLE)
  {
    require(
      welcomeBonusReceived[user] == false,
      'Welcome bonus already received'
    );
    token.mint(user, amount);
    welcomeBonusReceived[user] = true;
    emit WelcomeBonusReceived(user, amount);
  }

  function createService(
    string memory name,
    address provider,
    bytes32 buyerRole,
    uint256 price,
    uint256 supply,
    bool enabled,
    bool buyerCanCancel,
    bool providerCanCancel,
    bool buyerCanValidate,
    bool providerCanValidate
  ) public onlyRole(SERVICE_CREATOR_ROLE) returns (uint256) {
    serviceIds.increment();
    require(supply > 0, 'ServiceCatalog: Supply is 0');
    require(
      buyerCanValidate || providerCanValidate,
      'ServiceCatalog: Neither buyer nor provider can validate'
    );

    uint256 currentServiceId = serviceIds.current();
    services[currentServiceId].serviceId = currentServiceId;
    services[currentServiceId].name = name;
    services[currentServiceId].provider = provider;
    services[currentServiceId].buyerRole = buyerRole;
    services[currentServiceId].price = price;
    services[currentServiceId].supply = supply;
    services[currentServiceId].enabled = enabled;
    services[currentServiceId].buyerCanCancel = buyerCanCancel;
    services[currentServiceId].providerCanCancel = providerCanCancel;
    services[currentServiceId].buyerCanValidate = buyerCanValidate;
    services[currentServiceId].providerCanValidate = providerCanValidate;

    emit ServiceCreated(
      currentServiceId,
      name,
      provider,
      price,
      supply,
      enabled,
      buyerCanCancel,
      providerCanCancel,
      buyerCanValidate,
      providerCanValidate
    );

    return services[currentServiceId].serviceId;
  }

  function updateService(
    uint256 serviceId,
    uint256 price,
    uint256 supply
  ) public onlyRole(SERVICE_CREATOR_ROLE) {
    require(
      services[serviceId].serviceId != 0,
      'ServiceCatalog: Invalid serviceId'
    );
    services[serviceId].price = price;
    services[serviceId].supply = supply;
    emit ServiceUpdated(serviceId, price, supply);
  }

  function updateServiceProvider(uint256 serviceId, address serviceProvider)
    public
    onlyRole(SERVICE_CREATOR_ROLE)
  {
    require(
      services[serviceId].serviceId != 0,
      'ServiceCatalog: Invalid serviceId'
    );
    services[serviceId].provider = serviceProvider;
    emit ServiceProviderUpdated(serviceId, serviceProvider);
  }

  function enableService(uint256 serviceId)
    public
    onlyRole(SERVICE_CREATOR_ROLE)
  {
    require(
      services[serviceId].serviceId != 0,
      'ServiceCatalog: Invalid serviceId'
    );
    services[serviceId].enabled = true;
  }

  function disableService(uint256 serviceId)
    public
    onlyRole(SERVICE_CREATOR_ROLE)
  {
    require(
      services[serviceId].serviceId != 0,
      'ServiceCatalog: Invalid serviceId'
    );
    services[serviceId].enabled = false;
  }

  function updateDeal(uint256 dealId) public onlyRole(SERVICE_CREATOR_ROLE) {
    require(deals[dealId].dealId != 0, 'ServiceCatalog: Invalid dealId');
    emit DealUpdated(dealId);
  }

  /*function updateService(
    uint256 serviceId,
    bytes32 buyerRole,
    uint256 price,
    uint256 supply,
    bool enabled,
    bool buyerCanCancel,
    bool providerCanCancel,
    bool buyerCanValidate,
    bool providerCanValidate
  ) public onlyRole(SERVICE_CREATOR_ROLE) returns (uint256) {
    require(services[serviceId].serviceId != 0, "ServiceCatalog: Invalid serviceId");
    require(supply > 0, "ServiceCatalog: Supply is 0");
    require(buyerCanValidate || providerCanValidate, "ServiceCatalog: Neither buyer nor provider can validate");

    services[serviceId].buyerRole = buyerRole;
    services[serviceId].price = price;
    services[serviceId].supply = supply;
    services[serviceId].enabled = enabled;
    services[serviceId].buyerCanCancel = buyerCanCancel;
    services[serviceId].providerCanCancel = providerCanCancel;
    services[serviceId].buyerCanValidate = buyerCanValidate;
    services[serviceId].providerCanValidate = providerCanValidate;

    emit ServiceUpdated(
      serviceId,
      price,
      supply,
      enabled,
      buyerCanCancel,
      providerCanCancel,
      buyerCanValidate,
      providerCanValidate
    );

    return services[serviceId].serviceId;
  }*/

  function buyService(uint256 serviceId) public canBuyService {
    Service memory service = services[serviceId];
    require(service.serviceId != 0, 'ServiceCatalog: Invalid serviceId');
    require(service.enabled == true, 'ServiceCatalog: Service is disabled');
    require(
      hasRole(service.buyerRole, _msgSender()),
      'ServiceCatalog: Caller does not have buyer role'
    );
    require(service.supply != 0, 'ServiceCatalog: Supply of service is 0');

    // dealIds start from 1
    dealIds.increment();
    uint256 currentDealId = dealIds.current();

    // storing price on the deal incase the price of the service is updated after creation of the deal
    Deal memory deal = Deal({
      dealId: currentDealId,
      serviceId: serviceId,
      buyer: _msgSender(),
      price: service.price,
      cancelled: false,
      validated: false
    });
    deals[currentDealId] = deal;

    services[serviceId].supply = services[serviceId].supply - 1;
    token.transferFrom(_msgSender(), address(this), deal.price);

    emit DealCreated(
      currentDealId,
      serviceId,
      _msgSender(),
      service.provider,
      deal.price,
      deal.cancelled,
      deal.validated
    );
  }

  function cancelDealAsBuyer(uint256 dealId)
    public
    canCancelOrValidateDeal(dealId)
  {
    Deal memory deal = deals[dealId];
    require(
      services[deal.serviceId].buyerCanCancel == true,
      'ServiceCatalog: Buyer cannot cancel deal'
    );
    require(
      deal.buyer == _msgSender(),
      'ServiceCatalog: Only buyer can cancel deal'
    );

    cancelDeal(dealId);
  }

  function cancelDealAsProvider(uint256 dealId)
    public
    canCancelOrValidateDeal(dealId)
  {
    Deal memory deal = deals[dealId];
    require(
      services[deal.serviceId].providerCanCancel == true,
      'ServiceCatalog: Provider cannot cancel deal'
    );
    require(
      services[deal.serviceId].provider == _msgSender(),
      'ServiceCatalog: Only provider can cancel deal'
    );

    cancelDeal(dealId);
  }

  function validateDealAsBuyer(uint256 dealId)
    public
    canCancelOrValidateDeal(dealId)
  {
    Deal memory deal = deals[dealId];
    require(
      services[deal.serviceId].buyerCanValidate == true,
      'ServiceCatalog: Buyer cannot validate deal'
    );
    require(
      deal.buyer == _msgSender(),
      'ServiceCatalog: Only buyer can validate deal'
    );

    validateDeal(dealId);
  }

  function validateDealAsProvider(uint256 dealId)
    public
    canCancelOrValidateDeal(dealId)
  {
    Deal memory deal = deals[dealId];
    require(
      services[deal.serviceId].providerCanValidate == true,
      'ServiceCatalog: Provider cannot validate deal'
    );
    require(
      services[deal.serviceId].provider == _msgSender(),
      'ServiceCatalog: Only buyer can validate deal'
    );

    validateDeal(dealId);
  }

  function cancelDeal(uint256 dealId) internal {
    Deal memory deal = deals[dealId];
    deals[dealId].cancelled = true;
    token.transfer(deal.buyer, deal.price);

    emit DealCancelled(
      dealId,
      deal.serviceId,
      deal.buyer,
      services[deal.serviceId].provider,
      deals[dealId].cancelled,
      deal.validated
    );
  }

  function validateDeal(uint256 dealId) internal {
    Deal memory deal = deals[dealId];
    deals[dealId].validated = true;
    token.transfer(services[deal.serviceId].provider, deal.price);

    emit DealValidated(
      dealId,
      deal.serviceId,
      deal.buyer,
      services[deal.serviceId].provider,
      deal.cancelled,
      deals[dealId].validated
    );
  }

  function _msgSender()
    internal
    view
    override(ContextUpgradeable, ERC2771ContextUpgradeable)
    returns (address sender)
  {
    sender = ERC2771ContextUpgradeable._msgSender();
  }

  function _msgData()
    internal
    view
    override(ContextUpgradeable, ERC2771ContextUpgradeable)
    returns (bytes calldata)
  {
    return ERC2771ContextUpgradeable._msgData();
  }

  function _authorizeUpgrade(address) internal hasAdminRole {}
}
