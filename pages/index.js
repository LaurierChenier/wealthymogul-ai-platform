        {videoGeneration && (
          <div style={{ 
            background: '#f0f8ff', 
            border: '1px solid #0066cc', 
            borderRadius: '5px', 
            padding: '20px',
            marginTop: '20px'
          }}>
            <h3 style={{ color: '#0066cc', marginBottom: '15px' }}>
              {videoGeneration.provider === 'runway' ? 'Professional Video Generation Status:' : 'AI Video Generation Status:'}
            </h3>
            
            <div style={{ marginBottom: '10px' }}>
              <strong>Provider:</strong> 
              <span style={{ marginLeft: '8px' }}>
                {videoGeneration.provider === 'runway' ? 'Runway ML (Professional)' : 'Eden AI (Quick)'}
              </span>
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <strong>Status:</strong> 
              <span style={{ 
                color: videoGeneration.status === 'completed' || videoGeneration.status === 'succeeded' ? '#28a745' : 
                      videoGeneration.status === 'processing' || videoGeneration.status === 'pending' || videoGeneration.status === 'running' ? '#ffc107' : '#dc3545',
                marginLeft: '8px',
                fontWeight: 'bold'
              }}>
                {videoGeneration.status?.toUpperCase() || 'SUBMITTED'}
              </span>
              {videoGeneration.progress > 0 && (
                <span style={{ marginLeft: '8px', color: '#666' }}>
                  ({Math.round(videoGeneration.progress * 100)}%)
                </span>
              )}
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <strong>ID:</strong> {videoGeneration.publicId || videoGeneration.taskId}
            </div>
            
            {videoGeneration.lastChecked && (
              <div style={{ marginBottom: '10px' }}>
                <strong>Last Checked:</strong> {videoGeneration.lastChecked}
              </div>
            )}
            
            <div style={{ marginBottom: '15px' }}>
              <strong>Message:</strong> {videoGeneration.message}
            </div>

            {/* Show Check Status button for pending, running, or processing videos */}
            {(videoGeneration.status === 'processing' || 
              videoGeneration.status === 'pending' || 
              videoGeneration.status === 'running' ||
              videoGeneration.status === 'PENDING' ||
              videoGeneration.status === 'RUNNING') && (
              <div style={{ marginBottom: '15px' }}>
                <button 
                  onClick={handleRetrieveVideo}
                  disabled={isRetrieving}
                  style={{
                    padding: '10px 20px',
                    background: isRetrieving ? '#ccc' : '#0066cc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: isRetrieving ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    marginRight: '10px'
                  }}>
                  {isRetrieving ? 'Checking...' : 'Check Video Status'}
                </button>
                <small style={{ color: '#666' }}>
                  {videoGeneration.provider === 'runway' ? 
                    'Professional videos take 3-5 minutes to generate' : 
                    'Quick videos take about 2 minutes'
                  }
                </small>
              </div>
            )}

            {/* Show download button when video is ready */}
            {videoGeneration.videoUrl && (
              <div style={{ marginTop: '15px' }}>
                <strong style={{ color: '#28a745' }}>✅ Video Ready!</strong>
                {videoGeneration.freshTokenGenerated && (
                  <span style={{ color: '#28a745', fontSize: '12px', marginLeft: '8px' }}>
                    (Fresh download link)
                  </span>
                )}
                <br />
                <a 
                  href={videoGeneration.videoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    background: '#28a745',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '5px',
                    marginTop: '10px',
                    fontWeight: 'bold'
                  }}>
                  📥 Download Video
                </a>
              </div>
            )}
          </div>
        )}
