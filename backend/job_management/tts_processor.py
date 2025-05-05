
import os
import asyncio
import edge_tts
import logging

logger = logging.getLogger(__name__)

AUDIO_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "audio_files")
os.makedirs(AUDIO_DIR, exist_ok=True)

async def process_tts_request(job_id: str, text: str, voice: str, pitch: str, speed: str, volume: str) -> None:
    # Format TTS parameters
    pitch_value = "+0Hz" if pitch == "0" else f"{pitch}Hz"
    if not pitch_value.startswith("+") and not pitch_value.startswith("-"):
        pitch_value = f"+{pitch_value}"
        
    speed_percentage = int((float(speed) - 1) * 100)
    rate_value = f"+{speed_percentage}%" if speed_percentage >= 0 else f"{speed_percentage}%"
    
    volume_percentage = int(float(volume)) - 100
    volume_value = f"+{volume_percentage}%" if volume_percentage >= 0 else f"{volume_percentage}%"
    
    # Log the job parameters for debugging
    logger.info(f"Processing TTS job {job_id}: voice={voice}, text length={len(text)}")
    
    try:
        communicate = edge_tts.Communicate(
            text=text,
            voice=voice,
            rate=rate_value,
            volume=volume_value,
            pitch=pitch_value
        )
        
        filename = os.path.join(AUDIO_DIR, f"{job_id}.mp3")
        
        # Use a shorter timeout to prevent long-running jobs
        await asyncio.wait_for(communicate.save(filename), timeout=45.0)
        
        if not os.path.exists(filename) or os.path.getsize(filename) == 0:
            raise Exception(f"Failed to generate audio file for job {job_id}")
            
        file_size = os.path.getsize(filename)
        logger.info(f"Job {job_id}: TTS conversion saved to {filename} ({file_size} bytes)")
        
        # Add a small delay to ensure the file is properly written to disk
        await asyncio.sleep(0.5)
        
    except asyncio.TimeoutError:
        logger.error(f"TTS generation timed out for job {job_id}")
        raise Exception(f"TTS generation timed out for job {job_id}")
    except Exception as e:
        logger.error(f"Error processing TTS for job {job_id}: {str(e)}")
        raise
