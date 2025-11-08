fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Compile LND proto files when available
    // For now, we'll use manual gRPC client implementation
    // Uncomment when proto files are added:
    /*
    tonic_build::configure()
        .build_server(false)
        .compile(
            &["proto/lightning.proto", "proto/router.proto"],
            &["proto"],
        )?;
    */
    Ok(())
}
