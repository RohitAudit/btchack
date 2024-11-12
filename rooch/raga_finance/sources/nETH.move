module raga_finance::native_eth_coin {
    use std::option;
    use std::string;
    use moveos_std::signer;
    use moveos_std::account;
    use moveos_std::object::{Self, Object};
    use rooch_framework::coin::{Self, CoinInfo};
    use rooch_framework::coin_store::{Self, CoinStore};
    use rooch_framework::account_coin_store;
    friend raga_finance::bridge_receiver;

    
    /// NETH object
    struct NETH has key, store {}

    /// Treasury object having the coinStore metadata
    struct Treasury has key {
        coin_store: Object<CoinStore<NETH>>
    }

    struct CoinMetadata has key, store {
        share_price: u256,
        base_price: u256
    }


    fun init(owner: &signer) {
        let coin_info_obj = coin::register_extend<NETH>(
            string::utf8(b"Native ETH"),
            string::utf8(b"nETH"),
            option::none(),
            8,
        );

        object::transfer(coin_info_obj, @raga_finance);
        let coin_store = coin_store::create_coin_store<NETH>();
        let treasury_obj = object::new_named_object(Treasury { coin_store });
        object::transfer_extend(treasury_obj, @raga_finance);

        account::move_resource_to(owner, CoinMetadata {
            share_price: 100000000,
            base_price: 100000000
        });
    }

    public (friend) fun update_share_price(owner: &signer, share_price: u256) {
        let owner_address = signer::address_of(owner);
        let coin_metadata = account::borrow_mut_resource<CoinMetadata>(owner_address);
        coin_metadata.share_price = share_price;
    }

    #[view]
    public fun balance(from: &signer): u256 {
        account_coin_store::balance<NETH>(signer::address_of(from))
    }

    
    public entry fun transfer(from: &signer, to_addr: address, amount: u256) {
        account_coin_store::transfer<NETH>(from, to_addr, amount);
    }

    public (friend) fun mint(txn_signer: &signer, to_addr: address, amount: u256) {
        let coin_info_obj = object::borrow_mut_object<CoinInfo<NETH>>(txn_signer, coin::coin_info_id<NETH>());
        let coin = coin::mint_extend<NETH>(coin_info_obj, amount);
        account_coin_store::deposit_extend(to_addr, coin);
    }

}