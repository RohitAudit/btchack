module raga_finance::bridge_receiver {
    use moveos_std::signer;
    use moveos_std::account;
    use raga_finance::native_eth_coin;

    const VALID_DEST_ID: u64 = 1;
    const E_NOT_VALID_DESTINATION: u64 = 1;
    const E_NOT_VALID_TRANSACTION_TYPE: u64 = 2;

    struct BridgeReceiverConfig has key {
        destination_id: u64
    }

    fun init(admin: &signer) {
        account::move_resource_to(admin, BridgeReceiverConfig {
            destination_id: VALID_DEST_ID,
        });
    }

    public entry fun create_base_config(admin: &signer) {
       init(admin);
    }

    #[view]
    public fun get_destination(): u64 {
        let owner = signer::module_signer<BridgeReceiverConfig>();
        let owner_address = signer::address_of(&owner);
        let bridge_receiver = account::borrow_resource<BridgeReceiverConfig>(owner_address);
        bridge_receiver.destination_id
    }

    public entry fun change_destination_id(sender: &signer, dest_id: u64){
        let bridge_receiver = account::borrow_mut_resource<BridgeReceiverConfig>(signer::address_of(sender));
        bridge_receiver.destination_id = dest_id;
    }

    public entry fun receive_message(
        admin: &signer, dest: u64, transaction_type: u8, account: address, amount: u256
    ) {
        let receiver_dest_id = get_destination();
        assert!(dest == receiver_dest_id, E_NOT_VALID_DESTINATION);
        if(transaction_type == 1) {
            native_eth_coin::mint(admin, account, amount);
        } else if(transaction_type == 2) {
            native_eth_coin::update_share_price(admin, amount);
        } else {
            abort E_NOT_VALID_TRANSACTION_TYPE
        }
    }
}