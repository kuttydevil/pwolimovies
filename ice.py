import asyncio
import stun
import time
import urllib.parse
import logging

# Configure logging for detailed output
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

async def check_ice_server(server):
    """Checks the responsiveness and latency of an ICE server."""
    logging.info(f"Processing ICE server: {server}")
    url_parts = urllib.parse.urlparse(server)
    host = url_parts.netloc.split(':')[0]
    port = int(url_parts.netloc.split(':')[1]) if ':' in url_parts.netloc else 3478

    start_time = time.time()
    try:
        logging.info(f"Attempting connection to {host}:{port}")
        nat_type, external_ip, external_port = stun.get_ip_info(
            source_ip='0.0.0.0', stun_host=host, stun_port=port
        )
        latency = time.time() - start_time
        logging.info(f"Connection successful. NAT type: {nat_type}, External IP: {external_ip}, External Port: {external_port}")
        return {
            'server': server,
            'nat_type': nat_type,
            'latency': latency,
            'success': True
        }
    except Exception as e:
        logging.error(f"Error connecting to {server}: {e}")
        return {'server': server, 'error': str(e), 'success': False}

async def main():
    # Deduplicated list of STUN servers
    ice_servers = list(set([
    "stun:stun.l.google.com:19302",
    "stun:stun1.l.google.com:19302",
    "stun:stun2.l.google.com:19302",
    "stun:global.stun.twilio.com:3478?transport=udp",
    "stun:stunserver.org:3478",
    "stun:stun.softjoys.com:3478",
    "stun:stun.qvod.com:3478",
    "stun:stun.voippro.com:3478",
    "stun:stun.services.mozilla.com:3478",
    "stun:stun.schlund.de:3478",
    "stun:stun.sipdiscount.com:3478",
    "stun:stun.ideasip.com:3478",
    "stun:stun.bcs2005.net:3478",
    "stun:stun.bluesip.net:3478",
    "stun:stun.iptel.org:3478",
    "stun:stun.de:3478",
    "stun:stun.twt.it:3478",
    "stun:stun.1und1.de:3478",
    "stun:stun.gmx.de:3478",
    "stun:stun.1un1.de:3478",
    "stun:stun.gmx.net:3478",
    "stun:stun2.l.google.com:19302",
    "stun:stun4.l.google.com:19302",
    "stun:stun.services.mozilla.com:3478",
    "stun:stun.schlund.de:3478",
    "stun:stun.stunprotocol.org:3478",
    "stun:stun.voipgate.com:3478",
    "stun:stun.voipstunt.com:3478",
    "stun:stun.voipbuster.com:3478",
    "stun:stun.voipcheap.com:3478",
    "stun:stun.zoiper.com:3478",
    "stun:stun.sipnet.net:3478",
    "stun:stun.voxgratia.org:3478",
    "stun:stun.bcs2005.net:3478",
    "stun:stun.voipstunt.com:3478",
    "stun:stun.stunprotocol.org:3478",
    "stun:stun.rixtelecom.se:3478",
    "stun:stun.schlund.de:3478",
    "stun:stunserver.org:3478",
    "stun:stun.voipcheap.com:3478",
    "stun:stun.zoiper.com:3478",
    "stun:stun.softjoys.com:3478",
    "stun:stun.qq.com:3478",
    "stun:stun.iptel.org:3478",
    "stun:stun.l.google.com:19302",
    "stun:stun1.l.google.com:19302",
    "stun:stun3.l.google.com:19302",
    "stun:stun2.l.google.com:19302",
    "stun:stun4.l.google.com:19302",
    "stun:stun.gmx.de:3478",
    "stun:stun.gmx.net:3478",
    "stun:stun.1und1.de:3478",
    "stun:stun.schlund.de:3478",
    "stun:stun.stunprotocol.org:3478",
    "stun:stun.services.mozilla.com:3478",
    "stun:stun2.l.google.com:19302",
    "stun:stun:stun.l.google.com:19302",
    "stun:stun:stun1.l.google.com:19302",
    "stun:stun:stun2.l.google.com:19302",
    "stun:stun:stun3.l.google.com:19302",
    "stun:stun:stun4.l.google.com:19302",
    "stun:stun:stun.ekiga.net",
    "stun:stun:stun.ideasip.com",
    "stun:stun:stun.rixtelecom.se",
    "stun:stun:stun.schlund.de",
    "stun:stun:stun.stunprotocol.org:3478",
    "stun:stun:stun.voiparound.com",
    "stun:stun:stun.voipbuster.com",
    "stun:stun:stun.voipstunt.com",
    "stun:stun:stun.voxgratia.org",
    "stun:stun:23.21.150.121:3478",
    "stun:stun:iphone-stun.strato-iphone.de:3478",
    "stun:stun:numb.viagenie.ca:3478",
    "stun:stun:s1.taraba.net:3478",
    "stun:stun:s2.taraba.net:3478",
    "stun:stun:stun.12connect.com:3478",
    "stun:stun:stun.12voip.com:3478",
    "stun:stun:stun.1und1.de:3478",
    "stun:stun:stun.2talk.co.nz:3478",
    "stun:stun:stun.2talk.com:3478",
    "stun:stun:stun.3clogic.com:3478",
    "stun:stun:stun.3cx.com:3478",
    "stun:stun:stun.a-mm.tv:3478",
    "stun:stun:stun.aa.net.uk:3478",
    "stun:stun:stun.acrobits.cz:3478",
    "stun:stun:stun.actionvoip.com:3478",
    "stun:stun:stun.advfn.com:3478",
    "stun:stun:stun.aeta-audio.com:3478",
    "stun:stun:stun.aeta.com:3478",
    "stun:stun:stun.alltel.com.au:3478",
    "stun:stun:stun.altar.com.pl:3478",
    "stun:stun:stun.annatel.net:3478",
    "stun:stun:stun.antisip.com:3478",
    "stun:stun:stun.arbuz.ru:3478",
    "stun:stun:stun.avigora.com:3478",
    "stun:stun:stun.avigora.fr:3478",
    "stun:stun:stun.awa-shima.com:3478",
    "stun:stun:stun.awt.be:3478",
    "stun:stun:stun.b2b2c.ca:3478",
    "stun:stun:stun.bahnhof.net:3478",
    "stun:stun:stun.barracuda.com:3478",
    "stun:stun:stun.bluesip.net:3478",
    "stun:stun:stun.bmwgs.cz:3478",
    "stun:stun:stun.botonakis.com:3478",
    "stun:stun:stun.budgetphone.nl:3478",
    "stun:stun:stun.budgetsip.com:3478",
    "stun:stun:stun.cablenet-as.net:3478",
    "stun:stun:stun.callromania.ro:3478",
    "stun:stun:stun.callwithus.com:3478",
    "stun:stun:stun.cbsys.net:3478",
    "stun:stun:stun.chathelp.ru:3478",
    "stun:stun:stun.cheapvoip.com:3478",
    "stun:stun:stun.ciktel.com:3478",
    "stun:stun:stun.cloopen.com:3478",
    "stun:stun:stun.colouredlines.com.au:3478",
    "stun:stun:stun.comfi.com:3478",
    "stun:stun:stun.commpeak.com:3478",
    "stun:stun:stun.comtube.com:3478",
    "stun:stun:stun.comtube.ru:3478",
    "stun:stun:stun.cope.es:3478",
    "stun:stun:stun.counterpath.com:3478",
    "stun:stun:stun.counterpath.net:3478",
    "stun:stun:stun.cryptonit.net:3478",
    "stun:stun:stun.darioflaccovio.it:3478",
    "stun:stun:stun.datamanagement.it:3478",
    "stun:stun:stun.dcalling.de:3478",
    "stun:stun:stun.decanet.fr:3478",
    "stun:stun:stun.demos.ru:3478",
    "stun:stun:stun.develz.org:3478",
    "stun:stun:stun.dingaling.ca:3478",
    "stun:stun:stun.doublerobotics.com:3478",
    "stun:stun:stun.drogon.net:3478",
    "stun:stun:stun.duocom.es:3478",
    "stun:stun:stun.dus.net:3478",
    "stun:stun:stun.e-fon.ch:3478",
    "stun:stun:stun.easybell.de:3478",
    "stun:stun:stun.easycall.pl:3478",
    "stun:stun:stun.easyvoip.com:3478",
    "stun:stun:stun.efficace-factory.com:3478",
    "stun:stun:stun.einsundeins.com:3478",
    "stun:stun:stun.einsundeins.de:3478",
    "stun:stun:stun.ekiga.net:3478",
    "stun:stun:stun.epygi.com:3478",
    "stun:stun:stun.etoilediese.fr:3478",
    "stun:stun:stun.eyeball.com:3478",
    "stun:stun:stun.faktortel.com.au:3478",
    "stun:stun:stun.freecall.com:3478",
    "stun:stun:stun.freeswitch.org:3478",
    "stun:stun:stun.freevoipdeal.com:3478",
    "stun:stun:stun.fuzemeeting.com:3478",
    "stun:stun:stun.gmx.de:3478",
    "stun:stun:stun.gmx.net:3478",
    "stun:stun:stun.gradwell.com:3478",
    "stun:stun:stun.halonet.pl:3478",
    "stun:stun:stun.hellonanu.com:3478",
    "stun:stun:stun.hoiio.com:3478",
    "stun:stun:stun.hosteurope.de:3478",
    "stun:stun:stun.ideasip.com:3478",
    "stun:stun4.l.google.com:19302"
]))

    # Process all servers concurrently
    results = await asyncio.gather(*(check_ice_server(server) for server in ice_servers))

    # Separate successful and failed results
    successful_servers = sorted([result for result in results if result['success']], key=lambda x: x['latency'])
    failed_servers = [result for result in results if not result['success']]

    # Log results
    logging.info("\n--- Results ---")

    if successful_servers:
        logging.info("\nSuccessful ICE Servers (Ranked by Latency):")
        for server in successful_servers:
            logging.info(f" - {server['server']}: Latency = {server['latency']:.2f} seconds, NAT Type: {server['nat_type']}")

    if failed_servers:
        logging.info("\nFailed ICE Servers:")
        for server in failed_servers:
            logging.error(f" - {server['server']}: Error = {server['error']}")

if __name__ == '__main__':
    asyncio.run(main())
